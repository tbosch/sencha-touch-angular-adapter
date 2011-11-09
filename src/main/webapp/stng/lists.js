define(['ext', 'stng/util', 'stng/customComponent'], function(Ext, util) {
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