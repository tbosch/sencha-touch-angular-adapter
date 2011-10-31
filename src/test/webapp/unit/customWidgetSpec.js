define(['unit/testutils'], function(testutils) {

    describe("customWidget", function() {
        it("it should wrap the content in a scroll div if scrolling is enabled", function() {
            var c = testutils.compileAndRender('<st:custom scroll="true"><div id="someContent"></div></st:custom>');
            var someContent = c.element.children(".x-scroller").children("#someContent");
            expect(someContent.length).toBe(1);
        });
        it("it should not wrap the content in a scroll div if scrolling is disabled", function() {
            var c = testutils.compileAndRender('<st:custom><div id="someContent"></div></st:custom>');
            var someContent = c.element.children("#someContent");
            expect(someContent.length).toBe(1);
        });
    });
});
