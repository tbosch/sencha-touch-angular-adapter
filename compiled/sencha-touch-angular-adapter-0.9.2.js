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
;
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
    };

    require = function(deps, callback) {
        if (typeof callback === 'function') {
            var args = [];
            for (var i=0; i<deps.length; i++) {
                var dep = deps[i];
                args.push(defined[dep]);
            }
            callback.apply(this, args);
        }

    };
})(window);

/**
 * Wrapper around window.angular.
 */
define('angular',[], function() {
    if (typeof angular !== "undefined") {
        return angular;
    }
});

define('stng/util',['angular'], function(angular) {
    function stWidget(element) {
        var id = element.attr("id");
        return Ext.getCmp(id);
    }

    function nearestStWidget(element) {
        var widget;
        while (element.length>0 && element[0] !== document.documentElement) {
            widget = stWidget(element);
            if (widget) {
                return widget;
            } else {
                element = element.parent();
            }
        }
        return null;
    }

    var attributes = function(el) {
        var res = {};
        var attrs = el[0].attributes;
        for (var i = 0, l = attrs.length, attr; i < l; i++) {
            attr = attrs.item(i);
            res[attr.nodeName] = attr.nodeValue;
        }
        return res;
    };

    function stOptions(attrs) {
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

    function layoutWithParents(element) {
        while (element.length) {
            var widget = stWidget(element);
            if (widget) {
                if (widget.doComponentLayout) {
                    widget.doComponentLayout();
                }
                if (widget.doLayout) {
                    widget.doLayout();
                }
            }
            element = element.parent();
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
        }
    }

    var directAttributes = {
        'class': true,
        'style': true,
        'id': true
    };

    function getOptionsAndRemoveAttributes(element) {
        var attrs = attributes(element);
        // Remove all attributes from the element, so the dom stays clean.
        // But append the created options as a comment.
        for (var key in attrs) {
            if (!directAttributes[key] && key.indexOf(':')===-1) {
                element.removeAttr(key);
            }
        }
        var options = stOptions(attrs);
        element.prepend('<!-- options '+angular.toJson(options)+"-->");
        return options;
    }

    return {
        layoutWithParents: layoutWithParents,
        destroyWidgetsUnder: destroyWidgetsUnder,
        stWidget: stWidget,
        nearestStWidget: nearestStWidget,
        stOptions: stOptions,
        jqLite: angular.element,
        attributes: attributes,
        getOptionsAndRemoveAttributes: getOptionsAndRemoveAttributes
    }
});

define('ext',[], function() {
    if (typeof Ext !== "undefined") {
        return Ext;
    }
});

define('stng/globalScope',['angular'], function(angular) {
    var globalScope;
    var createCallbacks = [];
    function create() {
        globalScope = angular.scope();
        for (var i=0; i<createCallbacks.length; i++) {
            createCallbacks[i].call(this, globalScope);
        }
        return globalScope;
    }

    function onCreate(callback) {
        createCallbacks.push(callback);
    }
    return {
        create: create,
        onCreate: onCreate
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

    function isElement(element) {
        return element[0].nodeType === 1;
    }

    // Does not exist in jQLite of angular...
    function contents(element) {
        var res = [];
        var nodes;
        for (var i=0; i<element.length; i++) {
            nodes = element[i].childNodes;
            for (var j=0; j<nodes.length; j++) {
                res.push(nodes.item(j));
            }
        }
        return $(res);
    }

    function wrapInner(elements, newElementString) {
        var el, newEl;
        for (var i=0; i<elements.length; i++) {
            el = elements.eq(i);
            newEl = $(newElementString);
            newEl.append(contents(el));
            el.append(newEl);
        }
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
            var el = $(this.getTargetEl().dom);
            var childs = el.children();
            childs.addClass('x-list-item');
            wrapInner(childs, '<div class="x-list-item-body"></div>');
        }
    });

    Ext.reg('ng-list', Ext.AngularList);

    Ext.AngularGroupedList = Ext.extend(Ext.AngularBaseList, {
        initContent: function() {
            Ext.AngularGroupedList.superclass.initContent.call(this);
            var groupChilds = $(this.getTargetEl().dom).children();
            var groupChild, groupAttr, childs;
            for (var i = 0; i < groupChilds.length; i++) {
                groupChild = groupChilds.eq(i);
                if (isElement(groupChild)) {
                    groupChild.addClass('x-list-group');

                    groupAttr = groupChild.attr('group');
                    groupChild.removeAttr('group');

                    childs = groupChild.children();
                    childs.addClass('x-list-item');
                    wrapInner(childs, '<div class="x-list-item-body"></div>');
                    wrapInner(groupChild, '<div class="x-list-group-items"></div>');
                    groupChild.prepend('<h3 class="x-list-header">' + groupAttr + '</h3>');
                }
            }
        }

    });

    Ext.reg('ng-grouped-list', Ext.AngularGroupedList);

    angular.directive('st:selected', function(expression) {
        return function(element) {
            var scope = this;
            scope.$watch(expression, function(value) {
                if (value) {
                    element.addClass('x-item-selected');
                } else {
                    element.removeClass('x-item-selected');
                }
            });
        }
    });

    angular.Array.groupBy = function(array, property, propertyLength) {
        var groupsByKey = {};
        var groups = [];
        for (var i=0; i<array.length; i++) {
            var item = array[i];
            var key = item[property];
            if (propertyLength) {
                key = key.substring(0,propertyLength);
            }
            var group = groupsByKey[key];
            if (!group) {
                group = {group: key, entries: []};
                groupsByKey[key] = group;
                groups.push(group);
            }
            group.entries.push(item);
        }
        return groups;

    }

});

define('stng/navigation',['angular', 'stng/util'], function(angular, util) {
    var $ = util.jqLite;
    function splitAtFirstColon(value) {
        var pos = value.indexOf(':');
        if (pos===-1) {
            return [value];
        }
        return [
            value.substring(0, pos),
            value.substring(pos+1)
        ];
    }

    /*
     * Service for page navigation.
     * target has the syntax: [<transition>:]pageId
     */
    function navigate(target) {
        var parts = splitAtFirstColon(target);
        var animation, pageId;
        if (parts.length === 2) {
            animation = parts[0];
            pageId = parts[1];
        } else {
            pageId = parts[0];
            animation = undefined;
        }
        senchaActivate(pageId, animation);
    }

    var currentDialog;

    function senchaActivate(componentId, animation) {
        if (currentDialog) {
            currentDialog.hide();
            currentDialog = null;
        }
        if (componentId==='back') {
            return;
        }
        var widget;
        var element = $(document.getElementById(componentId));
        widget = util.stWidget(element);
        if (widget.floating) {
            widget.show();
            currentDialog = widget;
        } else {
            var parentWidget = widget.ownerCt;
            if (parentWidget.setActiveItem) {
                parentWidget.setActiveItem(widget, animation);
            }
        }
    }


    angular.service('$navigate', function() {
        return navigate;
    });

    /**
     * Helper function to put the navigation part out of the controller into the page.
     * @param scope
     */
    angular.Object.navigate = function(scope) {
        var service = scope.$service("$navigate");
        if (arguments.length === 2) {
            // used without the test.
            service(arguments[1]);
            return;
        }
        // parse the arguments...
        var test = arguments[1];
        var outcomes = {};
        var parts;
        for (var i = 2; i < arguments.length; i++) {
            parts = splitAtFirstColon(arguments[i]);
            outcomes[parts[0]] = parts[1];
        }
        if (test && test.then) {
            // test is a promise.
            test.then(function(test) {
                if (outcomes[test]) {
                    service(outcomes[test]);
                } else if (outcomes.success) {
                    service(outcomes.success);
                }
            }, function(test) {
                if (outcomes[test]) {
                    service(outcomes[test]);
                } else if (outcomes.failure) {
                    service(outcomes.failure);
                }
            });
        } else {
            if (outcomes[test]) {
                service(outcomes[test]);
            } else if (test !== false && outcomes.success) {
                service(outcomes.success);
            } else if (test === false && outcomes.failure) {
                service(outcomes.failure);
            }
        }
    };

    return navigate;

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

define('stng/settings',['stng/util'], function(util) {
    var metas = document.getElementsByTagName("meta");
    var props = {};
    for (var i = 0; i < metas.length; i++) {
        var meta = util.jqLite(metas[i]);
        props[meta.attr('name')] = meta.attr('content');
    }
    var options = util.stOptions(props);

    return options;
});

define('stng/compileIntegration',['angular', 'ext', 'stng/util', 'stng/settings', 'stng/globalScope'], function(angular, Ext, util, settings, globalScope) {
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

/**
 * Paging Support for lists.
 * Note that this will cache the result of two calls until the next eval cycle
 * or a change to the filter or orderBy arguments.
 * <p>
 * Operations on the result:
 * - hasMorePages: returns whether there are more pages that can be loaded via loadNextPage
 * - loadNextPage: Loads the next page of the list
 */
define('stng/paging',['ext', 'angular', 'stng/globalScope', 'stng/settings'], function(Ext, angular, globalScope, settings) {
    /**
     * The default page size for all lists.
     * Can be overwritten using array.pageSize or
     * a meta tag with name "list-page-size"
     **/
    if (!settings.listPageSize) {
        settings.listPageSize = 10;
    }

    var globalEvalId = 0;
    globalScope.onCreate(function(scope) {
        scope.$onEval(-99999, function() {
            globalEvalId++;
        });
    });

    var enhanceFunctions = {
        init : init,
        refresh : refresh,
        refreshIfNeeded : refreshIfNeeded,
        setFilter : setFilter,
        setOrderBy : setOrderBy,
        loadNextPage : loadNextPage,
        hasMorePages : hasMorePages,
        reset : reset
    };

    var usedProps = {
        pageSize: true,
        originalList: true,
        refreshNeeded: true,
        filter: true,
        orderBy: true,
        loadedCount: true,
        availableCount: true,
        evalId: true
    };


    function createPagedList(list) {
        var res = [];
        for (var fnName in enhanceFunctions) {
            res[fnName] = enhanceFunctions[fnName];
        }
        res.init(list);
        var oldHasOwnProperty = res.hasOwnProperty;
        res.hasOwnProperty = function(propName) {
            if (propName in enhanceFunctions || propName in usedProps) {
                return false;
            }
            return oldHasOwnProperty.apply(this, arguments);
        }
        return res;
    }

    function init(list) {
        if (list.pageSize) {
            this.pageSize = list.pageSize;
        } else {
            this.pageSize = settings.listPageSize;
        }
        this.originalList = list;
        this.refreshNeeded = true;
        this.reset();
    }

    function refresh() {
        var list = this.originalList;
        if (this.filter) {
            list = angular.Array.filter(list, this.filter);
        }
        if (this.orderBy) {
            list = angular.Array.orderBy(list, this.orderBy);
        }
        var loadedCount = this.loadedCount;
        if (loadedCount < this.pageSize) {
            loadedCount = this.pageSize;
        }
        if (loadedCount > list.length) {
            loadedCount = list.length;
        }
        this.loadedCount = loadedCount;
        this.availableCount = list.length;
        var newData = list.slice(0, loadedCount);
        var spliceArgs = [0, this.length].concat(newData);
        this.splice.apply(this, spliceArgs);
    }

    function refreshIfNeeded() {
        if (this.evalId != globalEvalId) {
            this.refreshNeeded = true;
            this.evalId = globalEvalId;
        }
        if (this.refreshNeeded) {
            this.refresh();
            this.refreshNeeded = false;
        }
        return this;
    }

    function setFilter(filterExpr) {
        if (!angular.Object.equals(this.filter, filterExpr)) {
            this.filter = filterExpr;
            this.refreshNeeded = true;
        }
    }

    function setOrderBy(orderBy) {
        if (!angular.Object.equals(this.orderBy, orderBy)) {
            this.orderBy = orderBy;
            this.refreshNeeded = true;
        }
    }

    function loadNextPage() {
        this.loadedCount = this.loadedCount + this.pageSize;
        this.refreshNeeded = true;
    }

    function hasMorePages() {
        this.refreshIfNeeded();
        return this.loadedCount < this.availableCount;
    }

    function reset() {
        this.loadedCount = 0;
        this.refreshNeeded = true;
    }

    /**
     * Returns the already loaded pages.
     * Also includes filtering (second argument) and ordering (third argument),
     * as the standard angular way does not work with paging.
     *
     * Does caching: Evaluates the filter and order expression only once in an eval cycle.
     * ATTENTION: There can only be one paged list per original list.
     */
    angular.Array.paged = function(list, filter, orderBy) {
        var pagedList = list.pagedList;
        if (!pagedList) {
            pagedList = createPagedList(list);
            list.pagedList = pagedList;
        }
        pagedList.setFilter(filter);
        pagedList.setOrderBy(orderBy);
        pagedList.refreshIfNeeded();
        return pagedList;

    };
});

define('stng/events',['angular', 'stng/util'], function(angular, util) {
    var $ = util.jqLite;

    function createEventHandler(element, listenerExpression) {
        return function() {
            var scope = element.scope();
            scope.$tryEval(listenerExpression, element[0]);
            scope.$service("$updateView")();
        };
    }

    function addEventListenerToElement(element, eventType, listenerExpression) {
        var scope = element.scope();
        var el = Ext.get(element[0]);
        el.on(eventType, createEventHandler(element, listenerExpression));
    }

    function addEventListenerToWidget(element, widget, eventType, listenerExpression) {
        var scope = element.scope();
        var handler = createEventHandler(element, listenerExpression);
        if (widget.events[eventType]) {
            widget.addListener(eventType, handler);
        } else {
            widget.addManagedListener(widget.getTargetEl(), eventType, handler, widget);
        }
    }

    /**
     * A directive to bind sencha touch events like touches, activate, deactivate, ....
     * Supports component events as well as gesture events.
     */
    angular.directive("st:event", function(expression, element) {
        var eventHandlers = angular.fromJson(expression);

        var linkFn = function($updateView, element) {
            var widget = util.stWidget(element);
            var eventCallbackExpression, eventType;
            for (eventType in eventHandlers) {
                eventCallbackExpression = eventHandlers[eventType];
                if (widget) {
                    addEventListenerToWidget(element, widget, eventType, eventCallbackExpression);
                } else {
                    addEventListenerToElement(element, eventType, eventCallbackExpression);
                }
            }
        };
        linkFn.$inject = ['$updateView'];
        return linkFn;
    });


});

define('stng/waitDialog',['ext', 'angular'], function(Ext, angular) {
    var showCalls = [];

    var loadDialog;

    function updateUi() {
        if (loadDialog) {
            loadDialog.hide();
            loadDialog = null;
        }
        if (showCalls.length > 0) {
            var lastCall = showCalls[showCalls.length - 1];
            var options = {};
            if (lastCall.msg) {
                options.msg = lastCall.msg;
            }
            loadDialog = new Ext.LoadMask(Ext.getBody(), options);
            loadDialog.show();
            if (lastCall.callback) {
                loadDialog.el.select('.x-mask').on('tap', lastCall.callback);
            }
        }
    }

    /**
     *
     * @param msg (optional)
     * @param tapCallback (optional)
     */
    function show() {
        var msg, tapCallback;
        if (typeof arguments[0] == 'string') {
            msg = arguments[0];
        }
        if (typeof arguments[0] == 'function') {
            tapCallback = arguments[0];
        }
        if (typeof arguments[1] == 'function') {
            tapCallback = arguments[1];
        }

        showCalls.push({msg: msg, callback: tapCallback});
        updateUi();
    }

    function hide() {
        showCalls.pop();
        updateUi();
    }

    /**
     *
     * @param promise
     * @param msg (optional)
     */
    function waitFor(promise, msg) {
        show();
        promise.always(function() {
            hide();
        });
    }

    /**
     *
     * @param promise
     * @param cancelData
     * @param msg (optional)
     */
    function waitForWithCancel(promise, cancelData, msg) {
        show(msg, function() {
            promise.reject(cancelData);
        });
        promise.always(function() {
            hide();
        });
    }

    function hideAll() {
        showCalls = [];
        updateUi();
    }

    var res = {
        show: show,
        hide: hide,
        waitFor: waitFor,
        waitForWithCancel:waitForWithCancel,
        hideAll: hideAll
    };

    angular.service('$waitDialog', function() {
        return res;
    });

    return res;
});

define('stng/input',['angular', 'stng/util', 'ext'], function(angular, util, Ext) {
    var $ = util.jqLite;

    var textWidgetTypes = {text: true, number: true, url: true, email: true};
    var oldInput = angular.widget("input");
    angular.widget("input", function(element) {
        var type = element[0].type;
        if (textWidgetTypes[type]) {
            type = "text";
        }
        // We fake an element during compile phase, as setting the type attribute
        // is not allowed by the dom (although it works in many browsers...)
        element[0] = {
            type: type
        };
        var oldBinder = oldInput.apply(this, arguments);
        var res = function(element) {
            return oldBinder.apply(this, arguments);
        };
        res.$inject = oldBinder.$inject;
        return res;
    });

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

define('stng/stngStyles',['angular'], function() {
    /* Special styles for sencha-touch-angular-adapter */
    var styles =
        /* Set block display for some elements. Needed due to our custom tags */
        ".st-spacer,.st-custom,.st-list,.st-grouped-list {display: block} " +
            /* Set ng-validation-error to override other border declarations for fields */
            ".ng-validation-error {border: 2px solid red !important}";
    angular.element(document).find('head').append('<style type=\"text/css\">' + styles + '</style>');
});

define('stng/sharedController',['angular'], function(angular) {
    function findCtrlFunction(name) {
        var parts = name.split('.');
        var base = window;
        var part;
        for (var i = 0; i < parts.length; i++) {
            part = parts[i];
            base = base[part];
        }
        return base;
    }

    function sharedCtrl(rootScope, name) {
        var ctrl = findCtrlFunction(name);
        var instance = rootScope[name];
        if (!instance) {
            instance = rootScope.$new(ctrl);
            rootScope[name] = instance;
        }
        return instance;
    }

    function parseSharedControllersExpression(expression) {
        var pattern = /(.*?):(.*?)($|,)/g;
        var match;
        var hasData = false;
        var controllers = {}
        while (match = pattern.exec(expression)) {
            hasData = true;
            controllers[match[1]] = match[2];
        }
        if (!hasData) {
            throw "Expression " + expression + " needs to have the syntax <name>:<controller>,...";
        }
        return controllers;
    }

    angular.directive('st:shared-controller', function(expression) {
        this.scope(true);
        var controllers = parseSharedControllersExpression(expression);
        return function(element) {
            var scope = this;
            for (var name in controllers) {
                scope[name] = sharedCtrl(scope.$root, controllers[name]);
            }
        }

    });
});

define('stng/disabled',['angular', 'stng/util'], function(angular, util) {
    angular.directive('st:enabled', function(expression) {
        return function(element) {
            var scope = this;
            var widget = util.stWidget(element);
            scope.$watch(expression, function(value) {
                if (value) {
                    widget.enable();
                } else {
                    widget.disable();
                }
            });
        }
    });
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
    'stng/paging',
    'stng/repeat',
    'stng/settings',
    'stng/events',
    'stng/waitDialog',
    'stng/input',
    'stng/stngStyles',
    'stng/sharedController',
    'stng/disabled'
], function(angular, util, compileIntegration) {
    compileIntegration.registerWidgets();
    return {
    }
});
})();
