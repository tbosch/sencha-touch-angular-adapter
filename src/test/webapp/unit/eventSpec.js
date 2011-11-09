define(['unit/testutils'], function(testutils) {
    describe("st:event", function() {
        it("should add listeners to widget events", function() {
            var c = testutils.compileAndRender('<st:textfield name="someProp" st:event="{action: \'someHandler()\'}"></st:textfield>');
            var called = false;
            c.scope.someHandler = function() {
                called = true;
            };
            c.widget.fireEvent("action");
            expect(called).toBeTruthy();
        });
        it("should add listeners to dom events on widget nodes", function() {
            var c = testutils.compileAndRender('<st:textfield name="someProp" st:event="{tap: \'someHandler()\'}"></st:textfield>');
            var called = false;
            c.scope.someHandler = function() {
                called = true;
            };
            jasmine.ui.simulate(c.widget.fieldEl.dom, "mousedown");
            jasmine.ui.simulate(c.widget.fieldEl.dom, "mouseup");
            expect(called).toBeTruthy();
        });

        it("should add listeners to dom events on normal nodes", function() {
            var c = testutils.compileAndRender('<st:panel><div st:event="{tap: \'someHandler()\'}"></div></st:panel>');
            var called = false;
            c.scope.someHandler = function() {
                called = true;
            };
            jasmine.ui.simulate(c.element.children()[0], "mousedown");
            jasmine.ui.simulate(c.element.children()[0], "mouseup");
            expect(called).toBeTruthy();
        });
    });
});