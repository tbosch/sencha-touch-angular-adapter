define(['angular'], function(angular) {

    describe("iff", function() {
        it('should return the second argument if the first is truthy', function() {
            expect(angular.Object.iff(null, true, 1, 2)).toEqual(1);
        });

        it('should return the third argument if the first is falsy', function() {
            expect(angular.Object.iff(null, false, 1, 2)).toEqual(2);
        });
    });

    describe("st:if", function() {
        var element, scope;

        function compile(html) {
            element = angular.element(html);
            scope = angular.compile(element)();
        }

        beforeEach(function() {
            scope = null;
            element = null;
        });

        it('should add the element if the expression is true', function() {
            compile('<div><span st:if="true">A</span></div>');
            expect(element.children('span').length).toEqual(1);
        });

        it('should remove the element if the expression is false', function() {
            compile('<div><span st:if="false">A</span></div>');
            expect(element.children('span').length).toEqual(0);
        });

        it('should use an own scope', function() {
            compile('<div><span st:if="true"><span ng:init="test = true"></span></span></div>');
            expect(scope.test).toBeFalsy();
            expect(element.children('span').scope().test).toBeTruthy();
        });
    });

});
