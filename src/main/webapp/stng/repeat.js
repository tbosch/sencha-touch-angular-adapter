define(['angular', 'stng/util', 'stng/compileIntegration'], function(angular, util, compileIntegration) {
    angular.directive('st:layoutonce', function(expression) {
        return function(element) {
            var executed = false;
            compileIntegration.afterEval(function() {
                if (!executed) {
                    var widget = util.nearestStWidget(element);
                    util.layoutWithParents(widget);
                    executed = true;
                }
            });
        }
    });

    /**
     * Overwrite the ng:repeat to trigger a relayout for all
     * new elements.
     */
    var oldRepeat = angular.widget('@ng:repeat');
    angular.widget('@ng:repeat', function(expression, element) {
        element.attr('st:layoutonce', 'true');
        var oldLinker = oldRepeat.apply(this, arguments);
        return function(element) {
            return oldLinker.apply(this, arguments);
        }
    });
});