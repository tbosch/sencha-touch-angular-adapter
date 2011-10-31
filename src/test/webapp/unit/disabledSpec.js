define(['unit/testutils'], function(testutils) {
    describe("disabled handling", function() {
        it("should enable and disable the widget", function() {
            var c = testutils.compileAndRender('<st:textfield name="someProp" st:enabled="enabled"></st:textfield>');
            var scope = c.scope;
            scope.enabled = true;
            scope.$eval();
            expect(c.widget.disabled).toBeFalsy();
            scope.enabled = false;
            scope.$eval();
            expect(c.widget.disabled).toBeTruthy();

        });

    });
});
