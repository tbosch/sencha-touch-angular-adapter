define(['angular', 'stng/util'], function(angular, util) {
    var $ = util.jqLite;

    angular.service("$activate", function() {
        return function(id, animation) {
            var widget;
            var element = $(document.getElementById(id));
            widget = util.stWidget(element);
            var parentWidget = widget.ownerCt;
            if (parentWidget.setActiveItem) {
                parentWidget.setActiveItem(widget, animation);
            } else {
                parentWidget.layout.setActiveItem(widget, animation);
                parentWidget.doLayout();
            }
        }
    });

    angular.service("$show", function() {
        return function(id) {
            var element = $(document.getElementById(id));
            var widget = util.stWidget(element);
            widget.show();
        }
    });

    angular.service("$hide", function() {
        return function(id) {
            var element = $(document.getElementById(id));
            var widget = util.stWidget(element);
            widget.hide();
        }
    });
});