define(['angular', 'stng/util'], function(angular, util) {
    angular.widget('st:store', function(element) {
        var id = element.attr('id');
        var fields = element.attr('fields').split(',');
        this.descend(true);
        this.directives(true);
        var store = new Ext.data.Store({
            fields: fields
        });
        // TODO is this needed? store.fields = fields;
        util.stores[id] = store;
        return function(element) {
        }
    });

    var evalPattern = /^{{.*}}$/;
    function evalOptions(scope, options) {
        var value;
        var res = {};
        for (var key in options) {
            value = options[key];
            if (value.matches && value.matches(evalPattern)) {
                value = scope.$eval(value);
            }
            res[key] = value;
        }
        return res;
    }

    function updateRecord(record, props) {
        var oldVal, currVal, changed;
        changed = false;
        for (var key in props) {
            oldVal = record.get(key);
            currVal = props[key];
            if (!angular.Object.equals(oldVal, currVal)) {
                record.set(key, currVal);
                changed = true;
            }
        }
        return changed;
    }

    angular.widget('st:entry', function(element) {
        this.descend(false);
        this.directives(false);

        var options = util.getOptionsAndRemoveAttributes(element);

        return function(element) {
            var parent = element.parent();
            var store = util.stores[parent.attr('id')];
            var obj = {};
            var records = store.add(obj);
            element.bind('remove', function() {
                // TODO does this work??
                store.remove(records);
            });

            var scope = this;
            this.$onEval(function() {
                var currOptions= evalOptions(scope, options);
                updateRecord(records[0], currOptions);
                // TODO fire a changed event??
            });
        }
    });

});
