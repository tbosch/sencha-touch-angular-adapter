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
            // TODO use senchas tools for this
            var childs = $(this.getTargetEl().dom).children();
            childs.addClass('x-list-item');
            wrapInner(childs, $('<div class="x-list-item-body"></div>'));
        }
    });

    Ext.reg('list', Ext.AngularList);

    Ext.AngularGroupedList = Ext.extend(Ext.AngularBaseList, {
        initContent: function() {
            Ext.AngularGroupedList.superclass.initContent.call(this);
            // TODO use senchas tools for this
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