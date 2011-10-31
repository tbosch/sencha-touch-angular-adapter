define(['angular', 'stng/util'], function(angular, util) {
    angular.directive('st:enabled', function(expression) {
        return function(element) {
            var scope = this;
            var widget = util.stWidget(element);
            scope.$watch(expression, function(value) {
                if (value) {
                    widget.enable();
                } else {
                    widget.disable();
                }
            });
        }
    });
});