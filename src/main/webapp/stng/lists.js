define(['ext', 'stng/util', 'stng/customComponent'], function(Ext, util) {
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
            if (this.scroll!==false) {
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
            Ext.AngularBaseList.superclass.initComponent.call(this);
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
        onTapStart: function(e) {
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
        onTapCancel: function(e) {
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
        onContainerTap: function() {
        },

        /**
         * Returns the template node by the Ext.EventObject or null if it is not found.
         * @param {Ext.EventObject} e
         */
        findTargetByEvent: function(e) {
            return e.getTarget(this.itemSelector, this.getTargetEl());
        }
    });

    Ext.AngularList = Ext.extend(Ext.AngularBaseList, {
        initContent: function() {
            Ext.AngularList.superclass.initContent.call(this);
            // TODO use senchas tools for this
            var childs = $(this.getTargetEl().dom).children('div');
            childs.addClass('x-list-item');
            wrapInner(childs, $('<div class="x-list-item-body"></div>'));
        }
    });

    Ext.reg('list', Ext.AngularList);

    Ext.AngularGroupedList = Ext.extend(Ext.AngularBaseList, {
        initContent: function() {
            Ext.AngularGroupedList.superclass.initContent.call(this);
            // TODO use senchas tools for this
            var groupChilds = $(this.getTargetEl().dom).children('div');
            var groupChild, groupAttr, childs;
            for (var i = 0; i < groupChilds.length; i++) {
                groupChild = $(groupChilds[i]);
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