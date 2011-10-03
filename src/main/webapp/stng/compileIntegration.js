define(['angular', 'ext', 'stng/util'], function(angular, Ext, util) {
    var $ = util.jqLite;

    function compilePage() {
        var element = $(document.getElementsByTagName("body"));
        var scope = angular.compile(element)();
    }

    var compileCounter = 0;
    var currentParent;
    angular.widget('@st:xtype', function(expression, compileElement) {
        var compiler = this;
        compileElement.removeAttr('st:xtype');
        var compileIndex = compileCounter++;
        var type = expression;
        this.descend(false);
        this.directives(false);
        var options = util.stOptions(compileElement[0]);

        return function(element) {
            var scope = this;

            function compileChildren(parent) {
                var oldParent = currentParent;
                currentParent = parent;
                var oldElement = scope.$element;
                var oldElement = scope.$element;
                // We are NOT creating an own scope for every widget.
                // For this, we need to save the $element.
                compiler.compile(element)(scope);
                scope.$element = oldElement;
                currentParent = oldParent;
            }

            options.el = Ext.Element.get(element[0]);
            var prototype = Ext.ComponentMgr.types[type].prototype;
            var oldInitContent = prototype.initContent;
            options.initContent = function() {
                var res = oldInitContent.apply(this, arguments);
                util.stWidget(element, this);
                compileChildren(this);
                return res;
            }
            var component = Ext.create(options, type);
            component.compileIndex = compileIndex;
            if (component && currentParent && !options.floating) {
                if (options.dock) {
                    currentParent.addDocked(component);
                } else {
                    // The insert index is defined by the element order in the original document.
                    // E.g. important if an element is added later via ng:repeat
                    // Especially needed as angular's ng:repeat uses $onEval to create
                    // it's children, and does not do this directly in the linking phase.
                    var insertIndex = 0;
                    while (insertIndex < currentParent.items.length && currentParent.items.getAt(insertIndex).compileIndex <= compileIndex) {
                        insertIndex++;
                    }
                    currentParent.add(insertIndex, component);
                }
            }
        }
    });

    return {
        compilePage: compilePage
    }

});