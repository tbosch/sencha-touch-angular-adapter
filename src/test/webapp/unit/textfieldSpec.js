define(['stng/util'], function(util) {
    var _container;

    afterEach(function() {
        if (_container) {
            _container.remove();
        }
    });


    function container() {
        if (!_container || !_container.parent()) {
            // We need to connect the element to the dom due to sencha's dom handling.
            _container = angular.element("<div></div>");
            var body = angular.element(document.getElementsByTagName("body"));
            body.append(_container);
        }
        return _container;
    }

    function compileAndRender(html) {
        // We need to connect the element to the dom due to sencha's dom handling.
        var element = angular.element(html);
        var c = container();
        c.append(element);
        var scope = angular.compile(c)();
        var widget = util.stWidget(element);
        widget.render(Ext.get(c));
        return {
            element: element,
            scope:scope,
            widget: widget
        };
    }

    describe('textfield', function() {
        it("should get it's value from from the scope via the name property", function() {
            var compiled = compileAndRender('<st:textfield name="someProp"></st:textfield>');
            var scope = compiled.scope;
            var widget = compiled.widget;
            scope.someProp = 'hallo';
            scope.$eval();
            expect(widget.getValue()).toBe(scope.someProp);
            widget.setValue('hallo2');
            // TODO use a better selector engine...
            // The one from sencha would be nice, but abstract this...
            var input = compiled.element[0].children.item(0).children.item(0);
            jasmine.ui.simulate(input, 'blur');
            expect(widget.getValue()).toBe(scope.someProp);

        });
    });
});