define(['angular', 'ext', 'stng/util'], function(angular, Ext, util) {

    var _container;

    var _ready = false;
    Ext.onReady(function() {
        _ready = true;
    });

    afterEach(function() {
        util.destroyWidgetsUnder(angular.element("body"));
        if (_container) {
            _container.remove();
        }
    });

    beforeEach(function() {
        waitsFor(function() {
            return _ready;
        });
        runs(function() {
            Ext.gesture.Manager.detachListeners();
            Ext.gesture.Manager.init();
            _container = angular.element("<div></div>");
            var body = angular.element(document.getElementsByTagName("body"));
            body.append(_container);
        });
    });


    function container() {
        return _container;
    }

    function compileAndRender(html) {
        var elements = angular.element(html);
        var c = container();
        c.append(elements);
        var scope = angular.compile(c)();
        var widgets = [];
        for (var i=0, el; i<elements.length; i++) {
            el = elements[i] = angular.element(elements[i]);
            var widget = util.stWidget(el);
            widget.render(Ext.get(c));
            widgets.push(widget);
        }
        if (elements.length===1) {
            return {
                element: elements[0],
                scope:scope,
                widget: widgets[0]
            };
        } else {
            return {
                elements: elements,
                scope:scope,
                widgets: widgets
            }
        }
    }

    function widget(id) {
        var el = angular.element(document.getElementById(id));
        return util.stWidget(el);
    }



    return {
        container: container,
        widget: widget,
        compileAndRender: compileAndRender
    }
});
