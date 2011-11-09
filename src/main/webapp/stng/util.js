define(['angular'], function(angular) {
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