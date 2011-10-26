define(['unit/testutils'], function(testutils) {
    describe('textfield', function() {
        it("should get it's value from from the scope via the name property", function() {
            runs(function() {
                var compiled = testutils.compileAndRender('<st:textfield name="someProp"></st:textfield>');
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
});