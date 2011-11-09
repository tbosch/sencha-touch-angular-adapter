define(['angular', 'stng/util'], function(angular, util) {
    var $ = util.jqLite;

    function createEventHandler(element, listenerExpression) {
        return function() {
            var scope = element.scope();
            scope.$tryEval(listenerExpression, element[0]);
            scope.$service("$updateView")();
        };
    }

    function addEventListenerToElement(element, eventType, listenerExpression) {
        var scope = element.scope();
        var el = Ext.get(element[0]);
        el.on(eventType, createEventHandler(element, listenerExpression));
    }

    function addEventListenerToWidget(element, widget, eventType, listenerExpression) {
        var scope = element.scope();
        var handler = createEventHandler(element, listenerExpression);
        if (widget.events[eventType]) {
            widget.addListener(eventType, handler);
        } else {
            widget.addManagedListener(widget.getTargetEl(), eventType, handler, widget);
        }
    }

    /**
     * A directive to bind sencha touch events like touches, activate, deactivate, ....
     * Supports component events as well as gesture events.
     */
    angular.directive("st:event", function(expression, element) {
        var eventHandlers = angular.fromJson(expression);

        var linkFn = function($updateView, element) {
            var widget = util.stWidget(element);
            var eventCallbackExpression, eventType;
            for (eventType in eventHandlers) {
                eventCallbackExpression = eventHandlers[eventType];
                if (widget) {
                    addEventListenerToWidget(element, widget, eventType, eventCallbackExpression);
                } else {
                    addEventListenerToElement(element, eventType, eventCallbackExpression);
                }
            }
        };
        linkFn.$inject = ['$updateView'];
        return linkFn;
    });


});
