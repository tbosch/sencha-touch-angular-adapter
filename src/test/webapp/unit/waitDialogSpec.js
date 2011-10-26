define(['ext'], function(Ext) {

    function tapOn(element) {
        jasmine.ui.simulate(element[0], 'mousedown');
        jasmine.ui.simulate(element[0], 'mouseup');
    }

    function tapOnLoader() {
        tapOn($(".x-mask"));
    }

    function loaderText() {
        return $(".x-mask").text();
    }

    function loaderVisible() {
        return $(".x-mask").length === 1;
    }

    describe("waitDialog", function() {
        var service;

        beforeEach(function() {
            service = angular.service("$waitDialog")();
            service.hideAll();
        });

        it('should show the wait dialog', function() {
            service.show();
            expect(loaderText()).toBeTruthy();
        });

        it('should show the default message when no message is given', function() {
            service.show();
            expect(loaderText()).toBe("Loading...");
        });

        it('should show the given message', function() {
            var someMsg = "someMsg";
            service.show(someMsg);
            expect(loaderText()).toBe(someMsg);
        });

        it('should hide the dialog if showing', function() {
            service.show();
            service.hide();
            expect(loaderVisible()).toBeFalsy();
        });

        it('should call the callback when the dialog is clicked', function() {
            var callback = jasmine.createSpy();
            service.show(callback);
            expect(callback).not.toHaveBeenCalled();
            tapOnLoader();
            expect(callback).toHaveBeenCalled();
        });


        it('should be able to stack show calls relative to the message', function() {
            service.show('test1');
            service.show('test2');
            expect(loaderText()).toBe("test2");
            service.hide();
            expect(loaderText()).toBe("test1");
            service.hide();
            expect(loaderVisible()).toBeFalsy();
        });

        it('should be able to stack show calls relative to the callbacks', function() {
            var callback1 = jasmine.createSpy();
            var callback2 = jasmine.createSpy();
            service.show('test1', callback1);
            service.show('test2', callback2);
            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).not.toHaveBeenCalled();
            tapOnLoader();
            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
            service.hide();
            tapOnLoader();
            expect(callback1).toHaveBeenCalled();
            expect(callback1).toHaveBeenCalled();
        });

        it('should waitFor the end of promises', function() {
            var p = $.Deferred();
            service.waitFor(p);
            expect(loaderVisible()).toBeTruthy();
            p.resolve();
            expect(loaderVisible()).toBeFalsy();
        });

        it('should not show the dialog for an already finished promise', function() {
            service.waitFor($.Deferred().resolve());
            expect(loaderVisible()).toBeFalsy();
        });

        it('should waitFor the end of promises and cancel promises when clicked', function() {
            var p = $.Deferred();
            var callback = jasmine.createSpy();
            p.fail(callback);
            var cancelRes = {test:true};
            service.waitForWithCancel(p, cancelRes);
            tapOnLoader();
            expect(callback).toHaveBeenCalledWith(cancelRes);
        });
    });

});