/**
 * The MIT License
 *
 * Copyright (c) 2011 Tobias Bosch (OPITZ CONSULTING GmbH, www.opitz-consulting.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function() {

// Placeholder for the build process

/**
 * Simple implementation of require/define assuming all
 * modules are named, in one file and in the correct order.
 * This is just what r.js produces.
 * This implementation is used for creating standalone bundles
 * that do no more require require.js
 */
// This syntax is needed for the namespace function of r.js to work.
var requirejs, require, define;
(function (window) {

    if (typeof define !== "undefined") {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }


    var defined = [];
    var def;
    define = def = function(name, deps, value) {
        var dotJs = name.indexOf('.js');
        if (dotJs!==-1) {
            name = name.substring(0, dotJs);
        }
        if (arguments.length==2) {
            // No deps...
            value = deps;
            deps = [];
        }
        if (typeof value === 'function') {
            var args = [];
            for (var i=0; i<deps.length; i++) {
                var dep = deps[i];
                args.push(defined[dep]);
            }
            value = value.apply(this, args);
        }
        defined[name] = value;
    }

    require = function(deps, callback) {
        if (typeof callback === 'function') {
            var args = [];
            for (var i=0; i<deps.length; i++) {
                var dep = deps[i];
                args.push(defined[dep]);
            }
            callback.apply(this, args);
        }

    }
})(window);

/**
 * Wrapper around window.angular.
 */
define('angular', function() {
    if (typeof angular !== "undefined") {
        return angular;
    }
});

define('stng/util',['angular'], function(angular) {
    function stWidget(element, widget) {
        if (widget === undefined) {
            return element.data('stwidget');
        } else {
            element.data('stwidget', widget);
            return widget;
        }
    }


    function nearestStWidget(element) {
        var widget;
        while (element[0] !== document.documentElement) {
            widget = element.data('stwidget');
            if (widget) {
                return widget;
            } else {
                element = element.parent();
            }
        }
        return null;
    }

    var getAttributes = function(el) {
        var res = {};
        var attrs = el.attributes;
        for (var i = 0, l = attrs.length, attr; i < l; i++) {
            attr = attrs.item(i);
            res[attr.nodeName] = attr.nodeValue;
        }
        return res;
    };

    function stOptions(el) {
        var attrs;
        if (el.nodeType) {
            attrs = getAttributes(el);
        } else {
            attrs = el;
        }
        var res = {};
        var key, value;
        for (key in attrs) {
            value = attrs[key];
            key = dashedToCamelCase(key);
            value = convertValue(key, value);
            setPropertyPathValue(res, key, value);
        }
        return res;
    }

    function dashedToCamelCase(string) {
        var parts = string.split('-');
        var res = parts[0];
        for (var i = 1, part; i < parts.length; i++) {
            part = parts[i];
            res += part.substring(0, 1).toUpperCase() + part.substring(1);
        }
        return res;
    }

    var intRegex = /^[0-9]+$/;

    function convertValue(key, value) {
        if (intRegex.test(value)) {
            value = parseInt(value);
        } else if (value === 'true') {
            value = true;
        } else if (value === 'false') {
            value = false;
        }
        return value;
    }

    function setPropertyPathValue(obj, propertyPath, value) {
        var parts, i, part;
        parts = propertyPath.split('.');
        for (i = 0; i < parts.length - 1; i++) {
            part = parts[i];
            if (!obj[part]) {
                obj[part] = {};
            }
            obj = obj[part];
        }
        obj[parts[parts.length - 1]] = value;
    }

    function layoutWithParents(widget) {
        while (widget) {
            if (widget.doComponentLayout) {
                widget.doComponentLayout();
            }
            if (widget.doLayout) {
                widget.doLayout();
            }
            widget = widget.ownerCt;
        }
    }

    function destroyWidgetsUnder(element) {
        var widget = stWidget(element);
        var children = element.children();
        for (var i=0; i<children.length; i++) {
            destroyWidgetsUnder(angular.element(children[i]));
        }
        if (widget) {
            widget.destroy();
            stWidget(element, undefined);
        }
    }

    return {
        layoutWithParents: layoutWithParents,
        destroyWidgetsUnder: destroyWidgetsUnder,
        stWidget: stWidget,
        nearestStWidget: nearestStWidget,
        stOptions: stOptions,
        jqLite: angular.element
    }
});

define('ext', function() {
    if (typeof Ext !== "undefined") {
        return Ext;
    }
});

define('stng/compileIntegration',['angular', 'ext', 'stng/util'], function(angular, Ext, util) {
    var $ = util.jqLite;

    function compilePage() {
        for (var type in Ext.ComponentMgr.types) {
            registerWidget(type);
        }

        var element = $(document.getElementsByTagName("body"));
        var scope = angular.compile(element)();
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
        compileElement.attr('st:compiled', 'true');

        var compileIndex = compileCounter++;
        this.descend(false);
        this.directives(false);
        var options = util.stOptions(compileElement[0]);

        return function(element) {
            var scope = this;

            function compileChildren(parent) {
                var oldParent = currentCompileParent;
                currentCompileParent = parent;
                var oldElement = scope.$element;
                // We are NOT creating an own scope for every widget.
                // For this, we need to save the $element.
                compiler.compile(element)(scope);
                scope.$element = oldElement;
                currentCompileParent = oldParent;
            }

            options.el = Ext.Element.get(element[0]);
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
                util.stWidget(element, this);
                compileChildren(this);
                return res;
            }
            var component = Ext.create(options, type);
            util.stWidget(element, component);
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

    function registerWidget(type) {
        angular.widget('st:'+type, function(element) {
            return compileWidget.call(this, type, element);
        })
    }

    return {
        compilePage: compilePage
    }

});

define('stng/customComponent',['ext', 'stng/util'], function(Ext, util) {
    var $ = util.jqLite;

    /**
     * A component that allows custom html children
     */
    Ext.AngularComponent = Ext.extend(Ext.Component, {
        children: undefined,

        onRender : function() {
            this.children = $(this.el.dom).children();
            Ext.AngularComponent.superclass.onRender.apply(this, arguments);
        },

        initContent: function() {
            // Move the children below the targetEl.
            // This is needed e.g. for scrolling.
            // Note that a container does this automatically by using
            // the layouts for his children components.
            var target = $(this.getTargetEl().dom);
            target.append(this.children);
        }
    });

    Ext.reg('custom', Ext.AngularComponent);
});

define('stng/lists',['ext', 'stng/util', 'stng/customComponent'], function(Ext, util) {
    var $ = util.jqLite;

    function wrapInner(element, newElement) {
        var oldChildren = element.children();
        element.append(newElement);
        newElement.append(oldChildren);
    }

    /**
     * Simple lists with event handling. Adds containertap event,
     * and also marking the pressed item.
     * For all other events use st:event
     */
    Ext.AngularBaseList = Ext.extend(Ext.AngularComponent, {
        componentCls: 'x-list',

        initComponent : function() {
            if (this.scroll!==false) {
                this.scroll = {
                    direction: 'vertical'
                };
            }
            Ext.AngularBaseList.superclass.initComponent.call(this);
        }
    });

    Ext.AngularList = Ext.extend(Ext.AngularBaseList, {
        initContent: function() {
            Ext.AngularList.superclass.initContent.call(this);
            var childs = $(this.getTargetEl().dom).children();
            childs.addClass('x-list-item');
            wrapInner(childs, $('<div class="x-list-item-body"></div>'));
        }
    });

    Ext.reg('list', Ext.AngularList);

    Ext.AngularGroupedList = Ext.extend(Ext.AngularBaseList, {
        initContent: function() {
            Ext.AngularGroupedList.superclass.initContent.call(this);
            var groupChilds = $(this.getTargetEl().dom).children();
            var groupChild, groupAttr, childs;
            for (var i = 0; i < groupChilds.length; i++) {
                groupChild = $(groupChilds[i]);
                if (groupChild[0].nodeName==='DIV') {
                    groupChild.addClass('x-list-group');
                    groupAttr = groupChild.attr('group');
                    groupChild.removeAttr('group');
                    childs = groupChild.children('div');
                    childs.addClass('x-list-item');
                    wrapInner(childs, $('<div class="x-list-item-body"></div>'));
                    wrapInner(groupChild, $('<div class="x-list-group-items"></div>'));
                    groupChild.prepend('<h3 class="x-list-header">' + groupAttr + '</h3>');
                }
            }
        }

    });

    Ext.reg('grouped-list', Ext.AngularGroupedList);

    angular.directive('st:selected', function(expression) {
        return function(element) {
            var scope = this;
            //var listElement = element.parents('.x-list-item');
            scope.$watch(expression, function(value) {
                if (value) {
                    element.addClass('x-item-selected');
                } else {
                    element.removeClass('x-item-selected');
                }
            });
        }
    });

});

define('stng/navigation',['angular', 'stng/util'], function(angular, util) {
    var $ = util.jqLite;

    angular.service("$activate", function() {
        return function(id, animation) {
            var widget;
            var element = $(document.getElementById(id));
            widget = util.stWidget(element);
            var parentWidget = widget.ownerCt;
            if (parentWidget.setActiveItem) {
                parentWidget.setActiveItem(widget, animation);
            } else {
                parentWidget.layout.setActiveItem(widget, animation);
                parentWidget.doLayout();
            }
        }
    });

    angular.service("$show", function() {
        return function(id) {
            var element = $(document.getElementById(id));
            var widget = util.stWidget(element);
            widget.show();
        }
    });

    angular.service("$hide", function() {
        return function(id) {
            var element = $(document.getElementById(id));
            var widget = util.stWidget(element);
            widget.hide();
        }
    });
});

/*
 * Defines the ng:if tag. This is useful if jquery mobile does not allow
 * an ng:switch element in the dom, e.g. between ul and li.
 * Uses ng:repeat and angular.Object.iff under the hood.
 */
define('stng/if',['angular'], function(angular) {
    angular.Object.iff = function(self, test, trueCase, falseCase) {
        if (test) {
            return trueCase;
        } else {
            return falseCase;
        }
    };

    angular.widget('@st:if', function(expression, element) {
        var newExpr = 'stif in $iff(' + expression + ",[1],[])";
        element.removeAttr('st:if');
        return angular.widget('@ng:repeat').call(this, newExpr, element);
    });
});

define('stng/repeat',['angular', 'stng/util'], function(angular, util) {

    /**
     * Modify original ng:repeat so that all created items directly have a parent
     * (old style repeat). This is slower, however simplifies the integration with sencha a lot!
     */
    angular.widget('@ng:repeat', function(expression, element) {
        element.removeAttr('ng:repeat');
        element.replaceWith(angular.element('<!-- ng:repeat: ' + expression + ' -->'));
        var linker = this.compile(element);
        return function(iterStartElement) {
            var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/),
                lhs, rhs, valueIdent, keyIdent;
            if (! match) {
                throw Error("Expected ng:repeat in form of '_item_ in _collection_' but got '" +
                    expression + "'.");
            }
            lhs = match[1];
            rhs = match[2];
            match = lhs.match(/^([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\)$/);
            if (!match) {
                throw Error("'item' in 'item in collection' should be identifier or (key, value) but got '" +
                    rhs + "'.");
            }
            valueIdent = match[3] || match[1];
            keyIdent = match[2];

            var children = [], currentScope = this;
            this.$onEval(function() {
                var index = 0,
                    childCount = children.length,
                    lastIterElement = iterStartElement,
                    collection = this.$tryEval(rhs, iterStartElement),
                    collectionLength = angular.Array.size(collection, true),
                    childScope,
                    key;

                for (key in collection) {
                    if (collection.hasOwnProperty(key)) {
                        if (index < childCount) {
                            // reuse existing child
                            childScope = children[index];
                            childScope[valueIdent] = collection[key];
                            if (keyIdent) childScope[keyIdent] = key;
                            lastIterElement = childScope.$element;
                            childScope.$position = index == 0
                                ? 'first'
                                : (index == collectionLength - 1 ? 'last' : 'middle');
                            childScope.$eval();
                        } else {
                            // grow children
                            childScope = angular.scope(currentScope);
                            childScope[valueIdent] = collection[key];
                            if (keyIdent) childScope[keyIdent] = key;
                            childScope.$index = index;
                            childScope.$position = index == 0
                                ? 'first'
                                : (index == collectionLength - 1 ? 'last' : 'middle');
                            children.push(childScope);
                            linker(childScope, function(clone) {
                                clone.attr('ng:repeat-index', index);

                                //temporarily preserve old way for option element
                                lastIterElement.after(clone);
                                lastIterElement = clone;
                            });
                        }
                        index ++;
                    }
                }

                // shrink children
                while (children.length > index) {
                    // Sencha Integration: Destroy widgets
                    var child = children.pop();
                    var childElement = child.$element;
                    util.destroyWidgetsUnder(childElement);
                    childElement.remove();
                }
            }, iterStartElement);
        };
    });
});

define('stng/setup',['stng/util', 'stng/compileIntegration'], function(util, compileIntegration) {
    var metas = document.getElementsByTagName("meta");
    var props = {};
    for (var i=0; i<metas.length; i++) {
        var meta = util.jqLite(metas[i]);
        props[meta.attr('name')] = meta.attr('content');
    }
    Ext.setup(util.stOptions(props));

    new Ext.Application({
        launch: compileIntegration.compilePage
    });
});

define('stng/events',['angular', 'stng/util'], function(angular, util) {
    var $ = util.jqLite;

    function addEventCallbackToWidget(widget, eventType) {
        function eventCallback(event) {
            var target;
            if (event.getTarget) {
                target = event.getTarget();
            } else {
                target = event.getEl().dom;
            }
            // Search from target upwards until we find
            // an element with a listener for that eventType
            var widgetEl = widget.dom;
            var customEvents, scope, ngEl, lastScope;
            do {
                ngEl = $(target);
                customEvents = ngEl.data('customEvents');
                if (customEvents && customEvents[eventType]) {
                    var listeners = customEvents[eventType];
                    scope = ngEl.scope();
                    lastScope = scope;
                    for (var i = 0; i < listeners.length; i++) {
                        scope.$tryEval(listeners[i], ngEl);
                    }
                }
                target = target.parentNode;
            } while (target !== null && target !== widgetEl);
            if (lastScope) {
                lastScope.$service("$updateView")();
            }
        }

        // Register the callback only once for every event type...
        var hasEvent = widget.customEvents && widget.customEvents[eventType];
        if (!widget.customEvents) {
            widget.customEvents = {};
        }
        widget.customEvents[eventType] = true;
        if (!hasEvent) {
            if (widget.events[eventType]) {
                widget.addListener(eventType, eventCallback);
            } else {
                widget.addManagedListener(widget.getTargetEl(), eventType, eventCallback, widget);
            }
        }
    }

    function addEventListenerToElement(target, eventType, listener) {
        var ngEl = $(target);
        var customEvents = ngEl.data('customEvents');
        if (!customEvents) {
            customEvents = {};
            ngEl.data('customEvents',customEvents);
        }
        var listeners = customEvents[eventType];
        if (!listeners) {
            listeners = [];
            customEvents[eventType] = listeners;
        }
        listeners.push(listener);
    }

    /**
     * A directive to bind sencha touch events like touches, activate, deactivate, ....
     * Supports component events as well as gesture events.
     */
    angular.directive("st:event", function(expression, element) {
        var eventHandlers = {};
        var pattern = /(.*?):(.*?)($|,)/g;
        var match;
        var hasData = false;
        while (match = pattern.exec(expression)) {
            hasData = true;
            var event = match[1];
            eventHandlers[event] = match[2];
        }
        if (!hasData) {
            throw "Expression " + expression + " needs to have the syntax <event>:<handler>,...";
        }

        var linkFn = function($updateView, element) {
            var widget = util.nearestStWidget(element);
            for (var eventType in eventHandlers) {
                // If we bind the handler to the widget,
                // we would get a memory leak when the element
                // is removed from the dom, but the widget still exists.
                // Therefore we are binding the handler to the dom element.
                addEventCallbackToWidget(widget, eventType);
                var handler = eventHandlers[eventType];
                addEventListenerToElement(element, eventType, handler);
            }
        };
        linkFn.$inject = ['$updateView'];
        return linkFn;
    });


});

define('stng/waitDialog',['ext', 'angular'], function(Ext, angular) {
    var loadDialog;
    var defaultMessage = 'Please wait...';

    /**
     *
     * @param msg (optional)
     */
    function show(msg) {
        if (!msg) {
            msg = defaultMessage;
        }
        loadDialog = new Ext.LoadMask(Ext.getBody(), {msg:msg});
        loadDialog.show();
    }

    function hide() {
        loadDialog.hide();
    }

    var res = {
        show: show,
        hide: hide
    };
    angular.service('$waitDialog', function() {
        return res;
    });
    return res;

});

define('stng/input',['angular'], function(angular) {
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
            var valueInScope;
            scope.$onEval(-1000, function() {
                var newValue = scope.$get(self.name);
                if (valueInScope!==newValue) {
                    setValue(self, newValue);
                    valueInScope = newValue;
                }
            });
            addChangeListener(this, function() {
                var value = getValue(self);
                // This is needed for inputtexts in the following case:
                // 1. value in scope: value0
                // 2. value in ui is set to a value1 with <enter>-key bound to a controller action
                // 3. controller action does something and resets the value to value0
                // This case is not detected by the usual $watch logic!
                valueInScope = value;
                scope.$set(self.name, value);
                scope.$service("$updateView")();
            });
        }
    };
});

// Wrapper module as facade for the internal modules.
define('st-angular',[
    'angular',
    'stng/util',
    'stng/compileIntegration',
    'stng/customComponent',
    'stng/lists',
    'stng/navigation',
    'stng/if',
    'stng/repeat',
    'stng/setup',
    'stng/events',
    'stng/waitDialog',
    'stng/input'
], function(angular, util, compileIntegration) {
    return {
    }
});
})();
