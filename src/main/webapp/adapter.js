Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'icon.png',
    glossOnIcon: false,
    onReady: compilePage
});

var afterCompileQueue = [];

function executeAfterCompileQueue() {
    while (afterCompileQueue.length > 0) {
        var callback = afterCompileQueue.shift();
        callback();
    }
}

function addAfterCompileCallback(callback) {
    if (afterCompileQueue.length == 0) {
        setTimeout(executeAfterCompileQueue, 0);
    }
    afterCompileQueue.push(callback);
}

function compilePage() {
    var element = $("body");
    angular.compile(element)();
    executeAfterCompileQueue();
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
        parentWidget.doLayout();
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

/**
 * A directive to bind sencha touch events like touches, activate, deactivate, ....
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
        var self = this;
        addAfterCompileCallback(function() {
            var widget = getWidget(element);
            for (var eventType in eventHandlers) {
                (function(eventType) {
                    var handler = eventHandlers[eventType];
                    widget.addListener(eventType, function(event) {
                        var res = self.$tryEval(handler, element);
                        $updateView();
                    });
                })(eventType);
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


angular.widget('div', function(compileElement) {
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
            component = new Ext.Toolbar(options);
            // Remove the dummy component again
            //component.remove(component.items.items[0]);
        } else if (type === 'tabpanel') {
            options.el = Ext.Element.get(element[0]);
            // TODO This is needed so that the container does not collapse.
            // Don't know why...
            options.items = [
                {title : ""}
            ];
            component = new Ext.TabPanel(options);
            // Remove the dummy component again
            component.remove(component.items.items[0]);
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
        addAfterCompileCallback(function() {
            var parent = getWidget(element);
            if (component && parent) {
                if (options.dock) {
                    parent.addDocked(component);
                } else {
                    parent.add(component);
                }
                // Set the active item initially, if we have a card layout.
                // However, this needs to be deferred, so that event listeners
                // have a chance to register themselves (via directives).
                if (parent.layout && parent.layout.setActiveItem && parent.items.length === 1) {
                    addAfterCompileCallback(function() {
                        parent.layout.setActiveItem(component);
                        parent.doLayout();
                    });
                } else {
                    // TODO Do this only once per $eval!
                    parent.doLayout();
                }
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
        addAfterCompileCallback(function() {
            var parent = getWidget(element);
            parent.add(component);
            parent.doLayout();

            // TODO: Why does the layout contain a small space above
            // the textarea, that will be removed when the active item is switched?
        });
    };
});


/**
 * Eventhandling for lists...
 */
function addListEventHandling(listComponent) {
    var overrides = {
        itemSelector : '.x-list-item',

        scroll: 'vertical',

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

        /**
         * @cfg {Boolean} allowDeselect Only respected if {@link #singleSelect} is true. If this is set to false,
         * a selected item will not be deselected when tapped on, ensuring that once an item has been selected at
         * least one item will always be selected. Defaults to allowed (true).
         */
        allowDeselect: true,

        /**
         * @cfg {String} triggerEvent
         * Defaults to 'singletap'. Other valid options are 'tap'
         */
        triggerEvent: 'singletap',

        triggerCtEvent: 'containertap',

        // @private
        onTap: function(e) {
            var item = this.findTargetByEvent(e);
            if (item) {
                Ext.fly(item).removeCls(this.pressedCls);
                if (this.onItemTap(item, e) !== false) {
                    this.fireEvent("itemtap", this, item, e);
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
            //if (this.allowDeselect) {
            //    this.clearSelections();
            //}
        },

        // @private
        onDoubleTap: function(e) {
            var item = this.findTargetByEvent(e);
            if (item) {
                this.fireEvent("itemdoubletap", this, item, e);
            }
        },

        // @private
        onSwipe: function(e) {
            var item = this.findTargetByEvent(e);
            if (item) {
                this.fireEvent("itemswipe", this, item, e);
            }
        },

        // @private
        onItemTap: function(item, e) {
            if (this.pressedTimeout) {
                clearTimeout(this.pressedTimeout);
                delete this.pressedTimeout;
            }
            return true;
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
         * @event itemtap
         * Fires when a node is tapped on
         * @param {Ext.DataView} this The DataView object
         * @param {Ext.Element} item The item element
         * @param {Ext.EventObject} e The event object
         */
        'itemtap',

        /**
         * @event itemdoubletap
         * Fires when a node is double tapped on
         * @param {Ext.DataView} this The DataView object
         * @param {Ext.Element} item The item element
         * @param {Ext.EventObject} e The event object
         */
        'itemdoubletap',

        /**
         * @event itemswipe
         * Fires when a node is swipped
         * @param {Ext.DataView} this The DataView object
         * @param {Ext.Element} item The item element
         * @param {Ext.EventObject} e The event object
         */
        'itemswipe',

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
        tapstart : me.onTapStart,
        tapcancel: me.onTapCancel,
        touchend : me.onTapCancel,
        doubletap: me.onDoubleTap,
        swipe    : me.onSwipe,
        scope    : me
    };
    eventHandlers[me.triggerEvent] = me.onTap;
    me.mon(me.getTargetEl(), eventHandlers);

}