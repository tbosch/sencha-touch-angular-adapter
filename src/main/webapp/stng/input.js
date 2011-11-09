define(['angular', 'stng/util', 'ext'], function(angular, util, Ext) {
    var $ = util.jqLite;

    function after(object, functionName, newFunction) {
        var oldFunction = object[functionName];
        object[functionName] = function() {
            var res = oldFunction.apply(this, arguments);
            newFunction.apply(this, arguments);
            return res;
        };
    }

    function before(object, functionName, newFunction) {
        var oldFunction = object[functionName];
        object[functionName] = function() {
            newFunction.apply(this, arguments);
            return oldFunction.apply(this, arguments);
        };
    }

    before(Ext.form.Field.prototype, "afterRender", function() {
        if (!this.el || !this.fieldEl) {
            return;
        }
        var el = $(this.el.dom);
        var fieldEl = $(this.fieldEl.dom);
        var copyAttrNames = ["ng:validate", "ng:format"];
        for (var i=0, attrName, attrValue; i<copyAttrNames.length; i++) {
            attrName = copyAttrNames[i];
            attrValue = el.attr(attrName);
            if (attrValue) {
                fieldEl.attr(attrName, attrValue);
            }
        }
    });


    after(Ext.form.Spinner.prototype, 'initEvents', function() {
        var self = this;
        var scope = angular.element(self.el.dom).scope();
        this.addListener('spin', function() {
            scope.$set(self.name, self.getValue());
            scope.$service("$updateView")();
        });
    });

    function shallowCloneArray(array) {
        if (!array) {
            return array;
        }
        return Array.prototype.slice.call(array);
    }

    var selectProto = Ext.form.Select.prototype;
    before(selectProto, "afterRender", function() {
        $(this.fieldEl.dom).attr('ng:non-bindable', 'true');
    });
    after(selectProto, "initEvents", function() {
        var self = this;
        if (self.name) {
            var scope = $(self.fieldEl.dom).scope();
            this.addListener('change', function() {
                scope.$set(self.name, self.getValue());
                scope.$service("$updateView")();
            });
            scope.$watch(self.name, function(value) {
                self.refreshOptions();
                self.setValue(value);
                // setValue might have set a default value when we did not have a value yet...
                var newValue = self.getValue();
                if (newValue!==value) {
                    scope.$set(self.name, newValue);
                }
            });
        }
    });

    selectProto.refreshOptions = function() {
        var el = $(this.fieldEl.dom);
        var scope = el.scope();
        var options = shallowCloneArray(scope.$eval(this.options));
        this.setOptions(options);
    };
    before(selectProto, "showComponent", selectProto.refreshOptions);

    var sliderProto = Ext.form.Slider.prototype;
    after(sliderProto, "initEvents", function() {
        var self = this;
        if (self.name) {
            var scope = $(self.fieldEl.dom).scope();
            this.addListener('change', function() {
                scope.$set(self.name, self.getValue());
                scope.$service("$updateView")();
            });
            scope.$watch(self.name, function(value) {
                if (!value) {
                    value = 0;
                }
                self.setValue(value);
            });
        }
    });
});