define(['angular'], function(angular) {
    // deactivate angulars normal input handling
    angular.widget('input', function() {
        return function() {

        }
    });

    function getValue(component) {
        if (component.isChecked) {
            return component.isChecked();
        }
        return component.getValue();
    }

    function setValue(component, value) {
        if (component.setChecked) {
            component.setChecked(value);
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

            scope.$watch(this.name, function(newValue) {
                setValue(self, newValue);
            });
            addChangeListener(this, function() {
                console.log("hallo"+getValue(self));
                scope.$set(self.name, getValue(self));
                scope.$service("$updateView")();
            });
        }
    };
});