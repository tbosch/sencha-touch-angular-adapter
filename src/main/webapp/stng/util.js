define(['angular'], function(angular) {
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

    return {
        layoutWithParents: layoutWithParents,
        stWidget: stWidget,
        nearestStWidget: nearestStWidget,
        stOptions: stOptions,
        jqLite: angular.element
    }
});