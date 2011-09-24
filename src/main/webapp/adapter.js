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
    while (element!==null && element!==rootElement) {
        element = element.parentNode;
    }
    return element===rootElement;
}

function destroyNotConnectedWidgets() {
    var widget;
    var widgets = Ext.ComponentMgr.all.getValues();
    for (var i=0; i<widgets.length; i++) {
        widget = widgets[i];
        if (widget.el && widget.el.dom) {
            if (!isConnectedToDocument(widget.el.dom)) {
                widget.destroy();
            }
        }
    }
}

var layoutRequestedContainer = {};

function requestLayout(container) {
    if (!layoutRequestedContainer[container.id]) {
        layoutRequestedContainer[container.id] = container;
    }
}

function layoutContainer() {
    for (var key in layoutRequestedContainer) {
        var container = layoutRequestedContainer[key];
        container.doLayout();
    }
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

angular.service("activate", function() {
    return function(id, animation) {
        var element = angular.element("#" + id);
        var widget = getWidget(element);
        var parent = angular.element(element.parent());
        var parentWidget = getWidget(parent);
        parentWidget.layout.setActiveItem(widget, animation);
        requestLayout(parentWidget);
    }
});

// TODO replace this with st:visible attribute...
// Or add it additionally?
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
        if (event.getTargetEl) {
            target = event.getTargetEl().dom;
        } else {
            target = event.getTarget();
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
                for (var i=0; i<listeners.length; i++) {
                    scope.$tryEval(listeners[i], ngEl);
                }
            }
            target = target.parentNode;
        } while (target!==null && target!==widgetEl);
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

angular.widget('div', function(compileElement) {
    var compileIndex = compileCounter++;
    var type = compileElement.attr('type');
    if (type === 'grouped-list') {
        compileElement.children('div').attr('type', 'grouped-listitem');
    }
    if (type === 'grouped-listitem') {
        compileElement.children('div').attr('type', 'listitem');
    }
    if (type === 'list') {
        compileElement.children('div').attr('type', 'listitem');
    }
    var options = getOptions(compileElement[0]);
    var compileAttributes = getAttributes(compileElement[0]);
    this.descend(true);
    this.directives(true);
    return function(element) {
        var scope = this;
        var component;

        // TODO why can't we use this:
        // var component = Ext.create(type);
        if (type === 'toolbar') {
            options.el = Ext.Element.get(element[0]);
            if (!options.dock) {
                options.dock = 'top';
            }
            component = new Ext.Toolbar(options);
        } else if (type === 'tabpanel') {
            //options.activeItem = 0;
            // Don't know why: Tabpanel needs an initial item
            // so that the tabbar is shown. Otherwise the tabbar
            // will never show up!
            options.items = [{title: 'test'}];
            options.el = Ext.Element.get(element[0]);
            component = new Ext.TabPanel(options);
            // remove the temporary item again...
            component.remove(component.items.getAt(0));
        } else if (type === 'panel') {
            options.el = Ext.Element.get(element[0]);
            component = new Ext.Panel(options);
        } else if (type === 'button') {
            options.el = Ext.Element.get(element[0]);
            component = new Ext.Button(options);
        } else if (type === 'custom') {
            options.el = Ext.Element.get(element[0]);
            component = new Ext.Component(options);
        } else if (type === 'list' || type === 'grouped-list') {
            element.addClass('x-list');
            element.wrapInner('<div></div>');
            options.scrollEl = Ext.Element.get(element.children()[0]);
            options.el = Ext.Element.get(element[0]);
            options.scroll = {
                direction: 'vertical',
                useIndicators: !this.indexBar
            };
            component = new Ext.Component(options);
            addListEventHandling(component);
            // TODO just for testing... remove this later...
            component.addListener('itemtap', function() {
                console.log("itemtap2");
            });
            component.addListener('containertap', function() {
                console.log("containertap");
            });
        } else if (type === 'listitem') {
            element.addClass('x-list-item');
            element.wrapInner('<div class="x-list-item-body"></div>');
        } else if (type === 'grouped-listitem') {
            element.addClass('x-list-group');
            element.prepend('<h3 class="x-list-header"></h3>');
            var groupHeaderElement = element.children('h3');
            var groupAttr = compileAttributes.group;
            if (groupAttr) {
                // This is a hack, as angular does not expose the
                // compileTemplate function (like the $eval...)
                angular.directive('ng:bind-template')(groupAttr, groupHeaderElement)
                    .call(scope, groupHeaderElement);
            }
            element.wrapInner('<div class="x-list-group-items"></div>');
        }
        if (component) {
            component.compileIndex = compileIndex;
        }

        addAfterEval(function() {
            // The parent.add is executed after the compilation of angular,
            // as only then the elements know their parents (especially for to ng:repeat).
            var parent = getWidget(element);
            if (component && parent) {
                if (options.dock) {
                    parent.addDocked(component);
                } else {
                    // The insert index is defined by the element order in the original document.
                    // E.g. important if an element is added later via ng:repeat
                    // Especially needed as angular's ng:repeat uses $onEval to create
                    // it's children, and does not do this directly in the linking phase.
                    var insertIndex = 0;
                    while (insertIndex<parent.items.length && parent.items.getAt(insertIndex).compileIndex<=compileIndex) {
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


function replaceElementAndCopyAttributes(element, newElement) {
    var attrs = getAttributes(element[0]);
    for (var key in attrs) {
        if (key !== 'type') {
            newElement.attr(key, attrs[key]);
        }
    }
    element.replaceWith(newElement);
}

// TODO create this for all other input components,
// url, email, textarea, ...
// TODO add compiler counter
angular.widget('input', function(element) {
    var options = getOptions(element[0]);
    var name = element.attr('name');
    this.descend(true);
    this.directives(true);
    return function(element) {
        var scope = this;
        var component;

        // TODO why can't we use this:
        // var component = Ext.create(type);
        // The Text-component uses a render-template.
        // So we use it, but replace the input field
        // with the angular field.
        component = new Ext.form.Text(options);
        var oldAfterRender = component.afterRender;

        component.afterRender = function() {
            // TODO include this in the real rendering,
            // so we do not create input elements for nothing...
            var createdInput = angular.element(this.el.dom).find('input');
            replaceElementAndCopyAttributes(createdInput, element);
            // replace the internal field-element.
            this.fieldEl = Ext.get(element[0]);
            return oldAfterRender.apply(this, arguments);
        };
        function dataChanged() {
            scope.$set(name, component.getValue());
            scope.$root.$service("$updateView")();

        }

        component.addListener('keyUp', dataChanged);
        component.addListener('change', dataChanged);
        scope.$watch(name, function(val) {
            component.setValue(val);
        });
        // TODO same handling as for divs, see above..
        addAfterEval(function() {
            var parent = getWidget(element);
            parent.add(component);
            requestLayout(parent);

            // TODO: Why does the layout contain a small space above
            // the textarea, that will be removed when the active item is switched?
        });
    };
});

/**
 * Event handling for lists. Adds containertap event,
 * and also marking the pressed item.
 * For all other events use st:event
 */
function addListEventHandling(listComponent) {
    var overrides = {
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
    };
    // TODO use some utility function vom Ext.Js for this...
    for (var key in overrides) {
        listComponent[key] = overrides[key];
    }
    listComponent.addEvents(
        /**
         * @event containertap
         * Fires when a tap occurs and it is not on a template node.
         * @param {Ext.DataView} this
         * @param {Ext.EventObject} e The raw event object
         */
        "containertap"
    );

    var me = listComponent;

    var eventHandlers = {
        singletap: me.onTap,
        tapstart : me.onTapStart,
        tapcancel: me.onTapCancel,
        touchend : me.onTapCancel,
        scope    : me
    };
    me.mon(me.getTargetEl(), eventHandlers);

}

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
