define(['angular', 'unit/testutils'], function(angular, testutils) {
    describe("navigate", function() {
        describe("$navigate service", function() {
            var navigate;
            beforeEach(function() {
                navigate = angular.service("$navigate")();
            });
            it('should be able to activate an item', function() {
                var c = testutils.compileAndRender('<st:panel layout="card"><st:textfield id="someId"></st:textfield></st:panel>');
                var setActiveItemSpy = spyOn(c.widget, 'setActiveItem');
                navigate('someId');
                expect(setActiveItemSpy).toHaveBeenCalledWith(c.widget.items.get(0), undefined);
            });

            it('should be able to change the page with a transition', function() {
                var c = testutils.compileAndRender('<st:panel layout="card"><st:textfield id="someId"></st:textfield></st:panel>');
                var setActiveItemSpy = spyOn(c.widget, 'setActiveItem');
                navigate('someTransition:someId');
                expect(setActiveItemSpy).toHaveBeenCalledWith(c.widget.items.get(0), 'someTransition');
            });

            it('should be able to show a dialog', function() {
                var c = testutils.compileAndRender('<st:panel id="someId" floating="true"></st:panel>');
                var showSpy = spyOn(c.widget, 'show');
                navigate('someId');
                expect(showSpy).toHaveBeenCalled();
            });

            it('should be able to hide a dialog using back', function() {
                var c = testutils.compileAndRender('<st:panel id="someDialog" floating="true"></st:panel>');
                var dialog = c.widget;
                var hideSpy = spyOn(dialog, 'hide');
                navigate('someDialog');
                expect(hideSpy).not.toHaveBeenCalled();
                navigate('back');
                expect(hideSpy).toHaveBeenCalled();
            });

            it('should be able to hide the current dialog when navigating to another item', function() {
                var c = testutils.compileAndRender('<st:panel id="someDialog" floating="true"></st:panel><st:panel layout="card"><st:textfield id="someId"></st:textfield></st:panel>');
                var dialog = c.widgets[0];
                var hideSpy = spyOn(dialog, 'hide');
                navigate('someDialog');
                expect(hideSpy).not.toHaveBeenCalled();
                navigate('someId');
                expect(hideSpy).toHaveBeenCalled();
            });
        });

        describe('$navigate expression', function() {
            var scope, navigateSpy;
            beforeEach(function() {
                navigateSpy = jasmine.createSpy();
                scope = angular.scope(null, angular.service, {$navigate: navigateSpy});
            });
            it('should navigate if a single argument is given', function() {
                scope.$eval("$navigate('myPage')");
                expect(navigateSpy).toHaveBeenCalledWith('myPage');
            });
            it('should navigate to the success outcome if result is not false', function() {
                scope.$eval("$navigate(undefined, 'success:page1', 'failure:page2')");
                expect(navigateSpy).toHaveBeenCalledWith('page1');
            });
            it('should navigate to the failure outcome if result is false', function() {
                scope.$eval("$navigate(false, 'success:page1', 'failure:page2')");
                expect(navigateSpy).toHaveBeenCalledWith('page2');
            });
            it('should navigate to the given outcome', function() {
                scope.$eval("$navigate('myout', 'success:page1', 'failure:page2', 'myout:page3')");
                expect(navigateSpy).toHaveBeenCalledWith('page3');
            });
            it('should navigate to the success outcome if promise is resolved', function() {
                var promise = $.Deferred().resolve();
                scope.test = promise;
                scope.$eval("$navigate(test, 'success:page1', 'failure:page2')");
                expect(navigateSpy).toHaveBeenCalledWith('page1');
            });
            it('should navigate to the failure outcome if promise is rejected', function() {
                var promise = $.Deferred().reject();
                scope.test = promise;
                scope.$eval("$navigate(test, 'success:page1', 'failure:page2')");
                expect(navigateSpy).toHaveBeenCalledWith('page2');
            });
            it('should navigate to the given outcome of the resolved promise', function() {
                var promise = $.Deferred().resolve('myout');
                scope.test = promise;
                scope.$eval("$navigate(test, 'success:page1', 'failure:page2', 'myout:page3')");
                expect(navigateSpy).toHaveBeenCalledWith('page3');
            });
            it('should navigate to the given outcome of the rejected promise', function() {
                var promise = $.Deferred().reject('myout');
                scope.test = promise;
                scope.$eval("$navigate(test, 'success:page1', 'failure:page2', 'myout:page3')");
                expect(navigateSpy).toHaveBeenCalledWith('page3');
            });
            it('should navigate to the given outcome with the given transition', function() {
                scope.$eval("$navigate('myout', 'success:page1', 'failure:page2', 'myout:transition1:page3')");
                expect(navigateSpy).toHaveBeenCalledWith('transition1:page3');
            });

        });

    });

});
