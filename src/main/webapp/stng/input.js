define(['angular'], function(angular) {
    // deactivate angulars normal input handling
    angular.widget('input', function() {
        return function() {

        }
    });

    function getValue(component) {
        if (component.isChecked) {
            if (component.xtype==='radiofield') {
                if (component.isChecked()) {
                    return component.getValue();
                } else {
                    return undefined;
                }
            } else {
                return component.isChecked();
            }
        }
        return component.getValue();
    }

    function setValue(component, value) {
        if (component.setChecked) {
            if (component.xtype==='radiofield') {
                if (component.value == value) {
                    component.setChecked(true);
                }
            } else {
                component.setChecked(value);
            }
        } else {
            component.setValue(value);
        }
    }

    function addChangeListener(component, listener) {
        if (component.events.check) {
            component.addListener('check', listener);
            component.addListener('uncheck', listener);
        } else if (component.events.spin) {
            component.addListener('spin', listener);
            component.addListener('change', listener);
        } else {
            component.addListener('change', listener);
        }
    }

    // register a change handler in the Ext.form.Field prototype,
    // which applies to all child classes!
    var oldInitEvents = Ext.form.Field.prototype.initEvents;
    Ext.form.Field.prototype.initEvents = function() {
        var res = oldInitEvents.apply(this, arguments);
        if (this.name) {
            var self = this;
            var scope = angular.element(self.el.dom).scope();
            var valueInScope;
            // Note: We cannot use the $watch function here, for the following case:
            // 1. value in scope: value0
            // 2. value in ui is set to a value1 with <enter>-key bound to a controller action
            // 3. controller action does something and resets the value to value0
            // This case is not detected by the usual $watch logic!
            scope.$onEval(-1000, function() {
                var newValue = scope.$get(self.name);
                if (valueInScope!==newValue) {
                    setValue(self, newValue);
                    valueInScope = newValue;
                }
            });
            addChangeListener(this, function() {
                var value = getValue(self);
                // This is needed to allow the usecase above (why we cannot use $watch).
                valueInScope = value;
                scope.$set(self.name, value);
                scope.$service("$updateView")();
            });
        }
    };
});