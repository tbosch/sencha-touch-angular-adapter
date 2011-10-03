define(['angular', 'stng/util'], function(angular, util) {
    var $ = util.jqLite;

    function addEventCallbackToWidget(widget, eventType) {
        function eventCallback(event) {
            var target;
            if (event.getTarget) {
                target = event.getTarget();
            } else {
                target = event.getEl().dom;
            }
            // Search from target upwards until we find
            // an element with a listener for that eventType
            var widgetEl = widget.dom;
            var customEvents, scope, ngEl, lastScope;
            do {
                ngEl = $(target);
                customEvents = ngEl.data('customEvents');
                if (customEvents && customEvents[eventType]) {
                    var listeners = customEvents[eventType];
                    scope = ngEl.scope();
                    lastScope = scope;
                    for (var i = 0; i < listeners.length; i++) {
                        scope.$tryEval(listeners[i], ngEl);
                    }
                }
                target = target.parentNode;
            } while (target !== null && target !== widgetEl);
            if (lastScope) {
                lastScope.$service("$updateView")();
            }
        }

        // Register the callback only once for every event type...
        var hasEvent = widget.customEvents && widget.customEvents[eventType];
        if (!widget.customEvents) {
            widget.customEvents = {};
        }
        widget.customEvents[eventType] = true;
        if (!hasEvent) {
            if (widget.events[eventType]) {
                widget.addListener(eventType, eventCallback);
            } else {
                widget.addManagedListener(widget.getTargetEl(), eventType, eventCallback, widget);
            }
        }
    }

    function addEventListenerToElement(target, eventType, listener) {
        var ngEl = $(target);
        var customEvents = ngEl.data('customEvents');
        if (!customEvents) {
            customEvents = {};
            ngEl.data('customEvents',customEvents);
        }
        var listeners = customEvents[eventType];
        if (!listeners) {
            listeners = [];
            customEvents[eventType] = listeners;
        }
        listeners.push(listener);
    }

    /**
     * A directive to bind sencha touch events like touches, activate, deactivate, ....
     * Supports component events as well as gesture events.
     */
    angular.directive("st:event", function(expression, element) {
        var eventHandlers = {};
        var pattern = /(.*?):(.*?)($|,)/g;
        var match;
        var hasData = false;
        while (match = pattern.exec(expression)) {
            hasData = true;
            var event = match[1];
            eventHandlers[event] = match[2];
        }
        if (!hasData) {
            throw "Expression " + expression + " needs to have the syntax <event>:<handler>,...";
        }

        var linkFn = function($updateView, element) {
            var widget = util.nearestStWidget(element);
            for (var eventType in eventHandlers) {
                // If we bind the handler to the widget,
                // we would get a memory leak when the element
                // is removed from the dom, but the widget still exists.
                // Therefore we are binding the handler to the dom element.
                addEventCallbackToWidget(widget, eventType);
                var handler = eventHandlers[eventType];
                addEventListenerToElement(element, eventType, handler);
            }
        };
        linkFn.$inject = ['$updateView'];
        return linkFn;
    });


});
