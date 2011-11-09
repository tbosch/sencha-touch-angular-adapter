define(['unit/testutils'], function(testutils) {
    describe("input", function() {
        describe('textfield', function() {
            var someValue = "someValue";
            it("should set the widget's value from the scope property", function() {
                var c = testutils.compileAndRender('<st:textfield name="someProp"></st:textfield>');
                c.scope.someProp = someValue;
                c.scope.$eval();
                expect(c.widget.getValue()).toBe(someValue);
                expect(c.element.find("input").val()).toBe(someValue);
            });

            it("should set the scope property from the widget on change", function() {
                var c = testutils.compileAndRender('<st:textfield name="someProp"></st:textfield>');
                expect(c.scope.someProp).toBeFalsy();
                var input = c.element.find("input");
                input.val(someValue);
                jasmine.ui.simulate(input[0], "change");
                expect(c.scope.someProp).toBe(someValue);
            });

            it("should use the ng:validate directive", function() {
                var c = testutils.compileAndRender('<st:textfield name="someProp" ng:validate="number"></st:textfield>');
                var input = c.element.find("input");
                var someErrorValue = "asdf";
                input.val(someErrorValue);
                jasmine.ui.simulate(input[0], "change");
                expect(c.scope.$service("$invalidWidgets").length).toBe(1);
                expect(c.scope.$service("$invalidWidgets")[0][0]).toBe(c.widget.fieldEl.dom);
            });
            it("should use the ng:format directive", function() {
                var c = testutils.compileAndRender('<st:textfield name="someProp" ng:format="number"></st:textfield>');
                var input = c.element.find("input");
                input.val("123");
                jasmine.ui.simulate(input[0], "change");
                expect(c.scope.someProp).toBe(123);
            });
        });

        describe('numberfield', function() {
            var someValue = "123";
            it("should set the widget's value from the scope property", function() {
                var c = testutils.compileAndRender('<st:numberfield name="someProp"></st:numberfield>');
                c.scope.someProp = someValue;
                c.scope.$eval();
                expect(c.widget.getValue()).toBe(someValue);
                expect(c.element.find("input").val()).toBe(someValue);
            });

            it("should set the scope property from the widget on change", function() {
                var c = testutils.compileAndRender('<st:numberfield name="someProp"></st:numberfield>');
                expect(c.scope.someProp).toBeFalsy();
                var input = c.element.find("input");
                input.val(someValue);
                jasmine.ui.simulate(input[0], "change");
                expect(c.scope.someProp).toBe(someValue);
            });
        });

        describe('urlfield', function() {
            var someValue = "http://asdf.de";
            it("should set the widget's value from the scope property", function() {
                var c = testutils.compileAndRender('<st:urlfield name="someProp"></st:urlfield>');
                c.scope.someProp = someValue;
                c.scope.$eval();
                expect(c.widget.getValue()).toBe(someValue);
                expect(c.element.find("input").val()).toBe(someValue);
            });

            it("should set the scope property from the widget on change", function() {
                var c = testutils.compileAndRender('<st:urlfield name="someProp"></st:urlfield>');
                expect(c.scope.someProp).toBeFalsy();
                var input = c.element.find("input");
                input.val(someValue);
                jasmine.ui.simulate(input[0], "change");
                expect(c.scope.someProp).toBe(someValue);
            });
        });

        describe('emailfield', function() {
            var someValue = "asdf@afd.de";
            it("should set the widget's value from the scope property", function() {
                var c = testutils.compileAndRender('<st:emailfield name="someProp"></st:emailfield>');
                c.scope.someProp = someValue;
                c.scope.$eval();
                expect(c.widget.getValue()).toBe(someValue);
                expect(c.element.find("input").val()).toBe(someValue);
            });

            it("should set the scope property from the widget on change", function() {
                var c = testutils.compileAndRender('<st:emailfield name="someProp"></st:emailfield>');
                expect(c.scope.someProp).toBeFalsy();
                var input = c.element.find("input");
                input.val(someValue);
                jasmine.ui.simulate(input[0], "change");
                expect(c.scope.someProp).toBe(someValue);
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
                var input = c.element.find("input");
                input.val(someNumber);
                jasmine.ui.simulate(input[0], "change");
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
                expect(c.widget.getValue()).toBe("Value1");
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

            it("should save the first option into the scope as default selection", function() {
                var c = testutils.compileAndRender('<st:selectfield ng:init="someOptions=[{value: \'Value1\', label: \'Label1\'}]" name="someSelect" options="someOptions" display-field="label" value-field="value"/>');
                expect(c.scope.someSelect).toBe('Value1');
            });
        });

        describe('sliderfield', function() {
            it("should set the widget's value from the scope property", function() {
                var c = testutils.compileAndRender('<st:sliderfield name="someProp"></st:sliderfield>');
                expect(c.widget.getValue()).toBe(0);
                c.scope.someProp = 10;
                c.scope.$eval();
                expect(c.widget.getValue()).toBe(10);
            });

            it("should set the scope property from the widget on change", function() {
                var c = testutils.compileAndRender('<st:sliderfield name="someProp"></st:sliederfield>');
                expect(c.scope.someProp).toBe(0);
                c.widget.thumbs[0].value = 10;
                c.widget.fireEvent('change');
                expect(c.scope.someProp).toBe(10);
            });

        })

        describe('togglefield', function() {
            it("should set the widget's value from the scope property", function() {
                var c = testutils.compileAndRender('<st:togglefield name="someProp"></st:togglefield>');
                expect(c.widget.getValue()).toBe(0);
                c.scope.someProp = true;
                c.scope.$eval();
                expect(c.widget.getValue()).toBe(1);
            });

            it("should set the scope property from the widget on click", function() {
                var c = testutils.compileAndRender('<st:togglefield name="someProp"></st:togglefield>');
                expect(c.scope.someProp).toBe(0);
                jasmine.ui.simulate(c.widget.fieldEl.dom, "mousedown");
                jasmine.ui.simulate(c.widget.fieldEl.dom, "mouseup");
                expect(c.scope.someProp).toBe(1);
            });

        })
    });

});