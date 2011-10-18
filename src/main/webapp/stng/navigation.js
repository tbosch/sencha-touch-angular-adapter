define(['angular', 'stng/util'], function(angular, util) {
    var $ = util.jqLite;
    function splitAtFirstColon(value) {
        var pos = value.indexOf(':');
        if (pos===-1) {
            return [value];
        }
        return [
            value.substring(0, pos),
            value.substring(pos+1)
        ];
    }

    /*
     * Service for page navigation.
     * target has the syntax: [<transition>:]pageId
     */
    function navigate(target) {
        var parts = splitAtFirstColon(target);
        var animation, pageId;
        if (parts.length === 2) {
            animation = parts[0];
            pageId = parts[1];
        } else {
            pageId = parts[0];
            animation = undefined;
        }
        senchaActivate(pageId, animation);
    }

    function senchaActivate(componentId, animation) {
        var widget;
        var element = $(document.getElementById(componentId));
        widget = util.stWidget(element);
        var parentWidget = widget.ownerCt;
        if (parentWidget.setActiveItem) {
            parentWidget.setActiveItem(widget, animation);
        } else {
            parentWidget.layout.setActiveItem(widget, animation);
            parentWidget.doLayout();
        }
    }


    angular.service('$navigate', function() {
        return navigate;
    });

    /**
     * Helper function to put the navigation part out of the controller into the page.
     * @param scope
     */
    angular.Object.navigate = function(scope) {
        var service = scope.$service("$navigate");
        if (arguments.length === 2) {
            // used without the test.
            service(arguments[1]);
            return;
        }
        // parse the arguments...
        var test = arguments[1];
        var outcomes = {};
        var parts;
        for (var i = 2; i < arguments.length; i++) {
            parts = splitAtFirstColon(arguments[i]);
            outcomes[parts[0]] = parts[1];
        }
        if (test && test.then) {
            // test is a promise.
            test.then(function(test) {
                if (outcomes[test]) {
                    service(outcomes[test]);
                } else if (outcomes.success) {
                    service(outcomes.success);
                }
            }, function(test) {
                if (outcomes[test]) {
                    service(outcomes[test]);
                } else if (outcomes.failure) {
                    service(outcomes.failure);
                }
            });
        } else {
            if (outcomes[test]) {
                service(outcomes[test]);
            } else if (test !== false && outcomes.success) {
                service(outcomes.success);
            } else if (test === false && outcomes.failure) {
                service(outcomes.failure);
            }
        }
    };

    return navigate;

});