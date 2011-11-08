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

            it("should set the scope property from the widget on click", function() {
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

        describe('radiofield', function() {
            it("should set the widget's value from the scope property", function() {
                var c = testutils.compileAndRender('<st:radiofield name="someProp" value="1"/><st:radiofield name="someProp" value="2"/>');
                c.scope.someProp = 1;
                expect(c.widgets[0].isChecked()).toBeFalsy();
                expect(c.elements[0].find("input").attr("checked")).toBeFalsy();
                expect(c.widgets[1].isChecked()).toBeFalsy();
                expect(c.elements[1].find("input").attr("checked")).toBeFalsy();
                c.scope.$eval();
                expect(c.widgets[0].isChecked()).toBeTruthy();
                expect(c.elements[0].find("input").attr("checked")).toBeTruthy();
                expect(c.widgets[1].isChecked()).toBeFalsy();
                expect(c.elements[1].find("input").attr("checked")).toBeFalsy();
                c.scope.someProp = 2;
                c.scope.$eval();
                expect(c.widgets[0].isChecked()).toBeFalsy();
                expect(c.elements[0].find("input").attr("checked")).toBeFalsy();
                expect(c.widgets[1].isChecked()).toBeTruthy();
                expect(c.elements[1].find("input").attr("checked")).toBeTruthy();
            });

            it("should set the scope property from the widget on click", function() {
                var c = testutils.compileAndRender('<st:radiofield name="someProp" value="1"/><st:radiofield name="someProp" value="2"/>');
                expect(c.scope.someProp).toBeFalsy();
                jasmine.ui.simulate(c.elements[0].find("input")[0], "click");
                expect(c.scope.someProp).toBe("1");
                jasmine.ui.simulate(c.elements[1].find("input")[0], "click");
                expect(c.scope.someProp).toBe("2");
            });
        });

        describe('selectfield', function() {
            it("should refresh the options when the value changes and show the selected option", function() {
                var c = testutils.compileAndRender('<st:selectfield name="someSelect" options="someOptions" display-field="label" value-field="value"/>');
                c.scope.someOptions = [{value: 'Value1', label: 'Label1'}];
                c.scope.someSelect = 'Value1';
                c.scope.$eval();
                expect(c.element.find("input").val()).toBe("Label1");
            });

            it("should not modify the options in the scope", function() {
                var c = testutils.compileAndRender('<st:selectfield name="someSelect" options="someOptions" display-field="label" value-field="value"/>');
                c.scope.someOptions = [{value: 'Value1', label: 'Label1'}];
                c.scope.someSelect = 'Value1';
                c.scope.$eval();
                expect(c.scope.someOptions).toEqual([{value: 'Value1', label: 'Label1'}]);
            });

            it("should show and refresh the possible options in a popup", function() {
                var c = testutils.compileAndRender('<st:selectfield name="someSelect" options="someOptions" display-field="label" value-field="value"/>');
                c.scope.someOptions = [{value: 'Value1', label: 'Label1'}];
                c.scope.someSelect = 'Value1';
                c.widget.showComponent();
                expect(c.widget.store.getCount()).toBe(1);
                expect(c.widget.store.getAt(0).data).toEqual(c.scope.someOptions[0]);
            });
        });

    });

});