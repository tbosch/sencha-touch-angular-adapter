// TODO make this configurable via a tag!
Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'icon.png',
    glossOnIcon: false,
    onReady: compilePage
});

var afterEvalQueue = [];

function executeAfterEvalQueue() {
    while (afterEvalQueue.length > 0) {
        var callback = afterEvalQueue.shift();
        callback();
    }
}

function addAfterEval(callback) {
    afterEvalQueue.push(callback);
}

function isConnectedToDocument(element) {
    var rootElement = document.documentElement;
    while (element !== null && element !== rootElement) {
        element = element.parentNode;
    }
    return element === rootElement;
}

function destroyNotConnectedWidgets() {
    var widget;
    var widgets = Ext.ComponentMgr.all.getValues();
    for (var i = 0; i < widgets.length; i++) {
        widget = widgets[i];
        if (widget.el && widget.el.dom) {
            if (!isConnectedToDocument(widget.el.dom)) {
                widget.destroy();
            }
        }
    }
}

var layoutRequestedContainer = {};
var layoutRequestedContainerList = [];

function requestLayout(container) {
    if (!layoutRequestedContainer[container.id]) {
        layoutRequestedContainer[container.id] = true;
        layoutRequestedContainerList.push(container);
    }
}

function layoutContainer() {
    for (var i = 0; i < layoutRequestedContainerList.length; i++) {
        var container = layoutRequestedContainerList[i];
        container.doLayout();
    }
    layoutRequestedContainer = {};
    layoutRequestedContainerList = [];

}

function compilePage() {
    var element = $("body");
    var scope = angular.compile(element)();

    function refresh() {
        executeAfterEvalQueue();
        destroyNotConnectedWidgets();
        // container layout must not happen until the hierarchy is completely updated.
        layoutContainer();
    }

    scope.$onEval(99999, refresh);
    refresh();
}


var getAttributes = function(el) {
    var res = {};
    var attrs = el.attributes;
    for (var i = 0, l = attrs.length, attr; i < l; i++) {
        attr = attrs.item(i);
        res[attr.nodeName] = attr.nodeValue;
    }
    return res;
}

var intRegex = /^[0-9]+$/;

function dashedToCamelCase(string) {
    var parts = string.split('-');
    var res = parts[0];
    for (var i = 1, part; i < parts.length; i++) {
        part = parts[i];
        res += part.substring(0, 1).toUpperCase() + part.substring(1);
    }
    return res;
}

function getOptions(el) {
    var res = getAttributes(el);
    var key, value;
    for (key in res) {
        value = res[key];
        delete res[key];
        key = dashedToCamelCase(key);
        if (intRegex.test(value)) {
            value = parseInt(value);
        } else if (value === 'true') {
            value = true;
        } else if (value === 'false') {
            value = false;
        }

        res[key] = value;
    }
    return res;
}

function getWidget(element) {
    var widget;
    while (element[0] !== document.documentElement) {
        widget = element.data().stwidget;
        if (widget) {
            return widget;
        } else {
            element = element.parent();
        }
    }
    return null;
}

// TODO remove history handling!
var activeWidgetStack = [];

function removeTailFromList(list, tailStart) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] === tailStart) {
            list.splice(i, list.length - i);
            return list;
        }
    }
}

function addActivateListener(component) {

    component.addListener('beforeactivate', function() {
        removeTailFromList(activeWidgetStack, component);
        activeWidgetStack.push(component);
        console.log(activeWidgetStack);
    });
}

angular.service("activate", function() {
    return function(id, animation) {
        var widget;
        if (id === 'back') {
            if (activeWidgetStack.length < 2) {
                return;
            }
            widget = activeWidgetStack[activeWidgetStack.length - 2];
            element = angular.element(widget.getEl().dom);
        } else {
            var element = angular.element("#" + id);
            widget = getWidget(element);
        }

        var activeWidget = activeWidgetStack[activeWidgetStack.length - 1];
        var parent = angular.element(element.parent());
        var parentWidget = getWidget(parent);
        parentWidget.layout.setActiveItem(widget, animation);

        requestLayout(parentWidget);
    }
});

angular.service("show", function() {
    return function(id) {
        var element = angular.element("#" + id);
        var widget = getWidget(element);
        widget.show();
    }
});

angular.service("hide", function() {
    return function(id) {
        var element = angular.element("#" + id);
        var widget = getWidget(element);
        widget.hide();
    }
});


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
        var customEvents, scope, ngEl;
        var lastScope;
        do {
            ngEl = angular.element(target);
            customEvents = ngEl.data().customEvents;
            if (customEvents && customEvents[eventType]) {
                var listeners = customEvents[eventType];
                scope = ngEl.scope();
                for (var i = 0; i < listeners.length; i++) {
                    scope.$tryEval(listeners[i], ngEl);
                }
            }
            target = target.parentNode;
        } while (target !== null && target !== widgetEl);
        angular.element("body").scope().$service("$updateView")();
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
    var ngEl = angular.element(target);
    var customEvents = ngEl.data().customEvents;
    if (!customEvents) {
        customEvents = {};
        ngEl.data().customEvents = customEvents;
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
        var handler = match[2];
        eventHandlers[event] = handler;
    }
    if (!hasData) {
        throw "Expression " + expression + " needs to have the syntax <event>:<handler>,...";
    }

    var linkFn = function($updateView, element) {
        addAfterEval(function() {
            var widget = getWidget(element);
            for (var eventType in eventHandlers) {
                // If we bind the handler to the widget,
                // we would get a memory leak when the element
                // is removed from the dom, but the widget still exists.
                // Therefore we are binding the handler to the dom element.
                addEventCallbackToWidget(widget, eventType);
                var handler = eventHandlers[eventType];
                addEventListenerToElement(element, eventType, handler);
            }
        });
    };
    linkFn.$inject = ['$updateView'];
    return linkFn;
});

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

var compileCounter = 0;

// Bugfix for tabpanel
// Don't know why: Tabpanel needs an initial item
// so that the tabbar is shown. Otherwise the tabbar
// will never show up!
Ext.FixedTabPanel = Ext.extend(Ext.TabPanel, {
    constructor : function(config) {
        if (!config.items || config.items.length == 0) {
            config.items = [
                {title: 'test'}
            ];
            var res = Ext.FixedTabPanel.superclass.constructor.call(this, config);
            this.remove(this.items.getAt(0));
            return res;
        } else {
            return Ext.FixedTabPanel.superclass.constructor.call(this, config);
        }
    }
});
Ext.reg('tabpanel', Ext.FixedTabPanel);


/**
 * A component that allows custom html children
 */
Ext.AngularComponent = Ext.extend(Ext.Component, {
    children: undefined,

    onRender : function() {
        // TODO use some Ext functions here instead of jquery
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


/**
 * Simple lists with event handling. Adds containertap event,
 * and also marking the pressed item.
 * For all other events use st:event
 */
Ext.AngularList = Ext.extend(Ext.AngularComponent, {
    componentCls: 'x-list',
    itemSelector : '.x-list-item',

    /**
     * @cfg {String} pressedCls
     * A CSS class to apply to an item on the view while it is being pressed (defaults to 'x-item-pressed').
     */
    pressedCls : "x-item-pressed",

    /**
     * @cfg {Number} pressedDelay
     * The amount of delay between the tapstart and the moment we add the pressedCls.
     * Settings this to true defaults to 100ms
     */
    pressedDelay: 100,

    initComponent : function() {
        if (!this.scroll) {
            this.scroll = {
                direction: 'vertical'
            };
        }
        this.addEvents(
            /**
             * @event containertap
             * Fires when a tap occurs and it is not on a template node.
             * @param {Ext.DataView} this
             * @param {Ext.EventObject} e The raw event object
             */
            "containertap"
        );

        var me = this;
        var eventHandlers = {
            singletap: me.onTap,
            tapstart : me.onTapStart,
            tapcancel: me.onTapCancel,
            touchend : me.onTapCancel,
            scope    : me
        };
        me.mon(me.getTargetEl(), eventHandlers);
        Ext.AngularList.superclass.initComponent.call(this);
    },

    // @private
    onTap: function(e) {
        var item = this.findTargetByEvent(e);
        if (item) {
            Ext.fly(item).removeCls(this.pressedCls);
            if (this.pressedTimeout) {
                clearTimeout(this.pressedTimeout);
                delete this.pressedTimeout;
            }
        }
        else {
            if (this.fireEvent("containertap", this, e) !== false) {
                this.onContainerTap(e);
            }
        }
    },

    // @private
    onTapStart: function(e, t) {
        var me = this,
            item = this.findTargetByEvent(e);

        if (item) {
            if (me.pressedDelay) {
                if (me.pressedTimeout) {
                    clearTimeout(me.pressedTimeout);
                }
                me.pressedTimeout = setTimeout(function() {
                    Ext.fly(item).addCls(me.pressedCls);
                }, Ext.isNumber(me.pressedDelay) ? me.pressedDelay : 100);
            }
            else {
                Ext.fly(item).addCls(me.pressedCls);
            }
        }
    },

    // @private
    onTapCancel: function(e, t) {
        var me = this,
            item = this.findTargetByEvent(e);

        if (me.pressedTimeout) {
            clearTimeout(me.pressedTimeout);
            delete me.pressedTimeout;
        }

        if (item) {
            Ext.fly(item).removeCls(me.pressedCls);
        }
    },

    // @private
    onContainerTap: function(e) {
    },

    /**
     * Returns the template node by the Ext.EventObject or null if it is not found.
     * @param {Ext.EventObject} e
     */
    findTargetByEvent: function(e) {
        return e.getTarget(this.itemSelector, this.getTargetEl());
    }
});

Ext.reg('list', Ext.AngularList);
Ext.reg('grouped-list', Ext.AngularList);


angular.widget('div', function(compileElement) {
    var compileIndex = compileCounter++;
    // TODO use 'xtype' here?
    var type = compileElement.attr('type');
    var options = getOptions(compileElement[0]);
    // TODO how to put this into the list-component??
    // E.g. wrap ng:repeat so that it always fires an event, when it creates
    // a new child?
    // E.g. Do a $watch for the length of the list. If it grows,
    // instrument the new items?
    // Problem: When an item is deleted and one is added at the same time,
    // the change is not recognized...
    // Idea: Always check all children for the needed class? Is this too slow?
    if (type === 'grouped-list') {
        var groupChilds = compileElement.children('div');
        var groupChild, groupAttr, childs;
        for (var i = 0; i < groupChilds.length; i++) {
            groupChild = $(groupChilds[i]);
            groupChild.addClass('x-list-group');
            groupAttr = groupChild.attr('group');
            groupChild.prepend('<h3 class="x-list-header">' + groupAttr + '</h3>');
            childs = groupChild.children('div');
            childs.addClass('x-list-item');
            childs.wrapInner('<div class="x-list-item-body"></div>');
            groupChild.wrapInner('<div class="x-list-group-items"></div>');
        }
    }
    if (type === 'list') {
        var childs = compileElement.children('div');
        childs.addClass('x-list-item');
        childs.wrapInner('<div class="x-list-item-body"></div>');
    }
    if (type === 'toolbar') {
        if (!options.dock) {
            options.dock = 'top';
        }
    }
    // TODO default für "sheet"
    // --> Alle components sollten ein "dock" haben.
    var compileAttributes = getAttributes(compileElement[0]);
    this.descend(true);
    this.directives(true);
    return function(element) {
        var scope = this;
        var component;
        if (!type) {
            // TODO look upwards in the dom tree for an stwidget.
            // If we find a container, set type to "custom".
            return;
        }
        options.el = Ext.Element.get(element[0]);
        component = Ext.create(options, type);
        if (component) {
            component.compileIndex = compileIndex;
            addActivateListener(component);
        }

        addAfterEval(function() {
            // The parent.add is executed after the compilation of angular,
            // as only then the elements know their parents (especially for to ng:repeat).
            var parent = getWidget(element);
            if (component && parent) {
                // TODO check if the parent is container. Otherwise show an error.
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
                requestLayout(parent);
            }
            element.data().stwidget = component;
        });
    }
});



angular.Object.iff = function(self, test, trueCase, falseCase) {
    if (test) {
        return trueCase;
    } else {
        return falseCase;
    }
}

angular.widget('@ng:if', function(expression, element) {
    var newExpr = 'ngif in $iff(' + expression + ",[1],[])";
    element.removeAttr('ng:if');
    return angular.widget('@ng:repeat').call(this, newExpr, element);
});
