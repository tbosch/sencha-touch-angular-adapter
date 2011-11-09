define(['angular', 'ext', 'stng/util', 'stng/settings', 'stng/globalScope'], function(angular, Ext, util, settings, globalScope) {
    var $ = util.jqLite;

    var angularOverrideWidgetTypePrefix = "ng-";

    function registerWidgets() {
        var types = Ext.ComponentMgr.types;
        for (var type in types) {
            if (!hasAngularOverrideWidget(types, type)) {
                registerWidget(type);
            }
        }
    }

    function xtype2angularWidgetName(xtype) {
        if (xtype.indexOf(angularOverrideWidgetTypePrefix)===0) {
            xtype = xtype.substring(3);
        }
        return xtype;
    }

    function hasAngularOverrideWidget(allTypes, type) {
        return !!allTypes[angularOverrideWidgetTypePrefix+type];
    }

    function registerWidget(type) {
        var widgetName = xtype2angularWidgetName(type);
        angular.widget('st:'+widgetName, function(element) {
            return compileWidget.call(this, type, element);
        })
    }

    var compileCounter = 0;
    var currentCompileParent;

    function compileWidget(type, compileElement) {
        var compiler = this;
        if (compileElement.attr('st:compiled')) {
            this.descend(true);
            this.directives(true);
            return function() {

            }
        }

        var options = util.getOptionsAndRemoveAttributes(compileElement);

        compileElement.attr('st:compiled', 'true');

        var compileIndex = compileCounter++;
        this.descend(false);
        this.directives(false);

        return function(element) {
            var scope = this;

            function compileChildren(parent) {
                var oldParent = currentCompileParent;
                currentCompileParent = parent;
                // We are NOT creating an own scope for every widget.
                // For this, we need to save the $element.
                var oldElement = scope.$element;
                // We really do need the second compile here,
                // as we also want to compile tags that were created by
                // sencha widgets (e.g. the button tag puts it's title attribute
                // as a text child, and that attribute might contain angular widgets like {{}}.
                compiler.compile(element)(scope);
                scope.$element = oldElement;
                currentCompileParent = oldParent;
            }

            options.el = Ext.Element.get(element[0]);
            options.id = element.attr("id");
            var prototype = Ext.ComponentMgr.types[type].prototype;
            var renderHookName;
            if (prototype.add) {
                // For Containers we need to create the children
                // within the initContent function, so that
                // the layout is already up to date.
                renderHookName = 'initContent';
            } else {
                // For components initContent is sometimes too early (e.g. for buttons),
                // to be sure that all angular markup like {{}} gets evaluated.
                renderHookName = 'afterRender';
            }
            var oldHook = prototype[renderHookName];
            options[renderHookName] = function() {
                var res = oldHook.apply(this, arguments);
                compileChildren(this);
                return res;
            };
            var component = Ext.create(options, type);
            component.compileIndex = compileIndex;
            var parent = currentCompileParent;
            if (!parent) {
                parent = util.nearestStWidget(element.parent());
            }
            if (component && parent && !options.floating) {
                if (options.dock) {
                    parent.addDocked(component);
                } else {
                    // The insert index is defined by the element order in the original document.
                    // E.g. important if an element is added later via ng:repeat
                    // Especially needed as angular's ng:repeat uses $onEval to create
                    // it's children, and does not do this directly in the linking phase.
                    var insertIndex = 0;
                    while (insertIndex < parent.items.length && parent.items.getAt(insertIndex).compileIndex <= compileIndex) {
                        insertIndex++;
                    }
                    parent.add(insertIndex, component);
                }
                if (!currentCompileParent) {
                    // During compilation from a parent we do not need to do an extra layout!
                    parent.doLayout();
                }
            }
        }
    }

    if (settings.autoStart) {
        settings.launch = function() {
            var element = $(document.getElementsByTagName("body"));
            angular.compile(element)(globalScope.create());
        };
        new Ext.Application(settings);
    }

    return {
        registerWidgets: registerWidgets
    }

});