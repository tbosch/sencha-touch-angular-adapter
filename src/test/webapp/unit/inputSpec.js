define(['unit/testutils'], function(testutils) {
    describe("input", function() {
        var someValue = "someValue";
        describe('textfield', function() {
            it("should set the widget's value from the scope property", function() {
                var c = testutils.compileAndRender('<st:textfield name="someProp"></st:textfield>');
                c.scope.someProp = someValue;
                c.scope.$eval();
                expect(c.widget.getValue()).toBe(someValue);
                expect(c.element.find("input").val()).toBe(someValue);
            });

            it("should set the scope property from the widget on blur", function() {
                var c = testutils.compileAndRender('<st:textfield name="someProp"></st:textfield>');
                expect(c.scope.someProp).toBeFalsy();
                var input = c.element.find("input");
                input.val(someValue);
                jasmine.ui.simulate(input[0], "blur");
                expect(c.scope.someProp).toBe(someValue);
            });

            it("should allow to change the scope property back to the old value in event handlers", function() {
                var oldValue = "oldValue";
                var c = testutils.compileAndRender('<st:textfield name="someProp" st:event="{blur: \'blur()\'}"></st:textfield>');
                c.scope.someProp = oldValue;
                c.scope.$eval();
                c.scope.blur = function() {
                    c.scope.someProp = oldValue;
                };
                var input = c.element.find("input");
                input.val(someValue);
                jasmine.ui.simulate(input[0], "blur");
                c.scope.$eval();
                expect(c.widget.getValue()).toBe(oldValue);
            });
        });

        describe('checkboxfield', function() {
            it("should set the widget's value from the scope property", function() {
                var c = testutils.compileAndRender('<st:checkboxfield name="someProp"></st:checkboxfield>');
                c.scope.someProp = true;
                expect(c.widget.isChecked()).toBeFalsy();
                c.scope.$eval();
                expect(c.widget.isChecked()).toBeTruthy();
                expect(c.element.find("input").attr("checked")).toBeTruthy();
            });

            it("should set the scope property from the widget on blur", function() {
                var c = testutils.compileAndRender('<st:checkboxfield name="someProp"></st:checkboxfield>');
                expect(c.scope.someProp).toBeFalsy();
                var input = c.element.find("input");
                jasmine.ui.simulate(input[0], "click");
                expect(c.scope.someProp).toBeTruthy();

            });
        });

        describe('spinnerfield', function() {
            var someNumber = '10';
            it("should set the widget's value from the scope property", function() {
                var c = testutils.compileAndRender('<st:spinnerfield name="someProp"></st:spinnerfield>');
                c.scope.someProp = someNumber;
                expect(c.widget.getValue()).toBe('0');
                c.scope.$eval();
                expect(c.widget.getValue()).toBe(someNumber);
                expect(c.element.find("input").val()).toBe(someNumber);
            });

            it("should set the scope property from the widget on blur", function() {
                var c = testutils.compileAndRender('<st:spinnerfield name="someProp"></st:spinnerfield>');
                expect(c.scope.someProp).toBeFalsy();
                var input = c.element.find("input");
                input.val(someNumber);
                jasmine.ui.simulate(input[0], "blur");
                expect(c.scope.someProp).toBe(someNumber);
            });

            it("should set the scope property from the widget on tap to the spin down button", function() {
                var c = testutils.compileAndRender('<st:spinnerfield name="someProp"></st:spinnerfield>');
                c.widget.setValue(someNumber);
                var input = c.element.find(".x-spinner-down");
                jasmine.ui.simulate(input[0], "mousedown");
                jasmine.ui.simulate(input[0], "mouseup");
                expect(c.scope.someProp).toBe('9');
            });
            it("should set the scope property from the widget on tap to the spin up button", function() {
                var c = testutils.compileAndRender('<st:spinnerfield name="someProp"></st:spinnerfield>');
                c.widget.setValue(someNumber);
                var input = c.element.find(".x-spinner-up");
                jasmine.ui.simulate(input[0], "mousedown");
                jasmine.ui.simulate(input[0], "mouseup");
                expect(c.scope.someProp).toBe('11');
            });

        });

    });

});