define(['unit/testutils'], function(testutils) {

    describe("list", function() {
        it("it should wrap the content in a scroll div if scrolling is enabled", function() {
            var c = testutils.compileAndRender('<st:list scroll="true"><div id="someContent"></div></st:list>');
            var someContent = c.element.children(".x-scroller").children("#someContent");
            expect(someContent.length).toBe(1);
        });
        it("it should not wrap the content in a scroll div if scrolling is disabled", function() {
            var c = testutils.compileAndRender('<st:list scroll="false"><div id="someContent"></div></st:list>');
            var someContent = c.element.children("#someContent");
            expect(someContent.length).toBe(1);
        });
        it("should scroll be default", function() {
            var c = testutils.compileAndRender('<st:list><div id="someContent"></div></st:list>');
            expect(c.element.children(".x-scroller").length).toBe(1);
        });
        it("should add x-list-item class to all children", function() {
            var c = testutils.compileAndRender('<st:list scroll="false"><div id="entry1"/><div id="entry2"/></st:list>');
            expect(c.element.children("#entry1").hasClass("x-list-item")).toBeTruthy();
            expect(c.element.children("#entry2").hasClass("x-list-item")).toBeTruthy();
        });
        it("should wrap the content of all children into a div with x-list-item-body class", function() {
            var c = testutils.compileAndRender('<st:list scroll="false"><div id="entry1">text1<span id="span1"/></div><div id="entry2">text2<span id="span2"/></div></st:list>');
            expect(c.element.children("#entry1").children(".x-list-item-body").children("#span1").length).toBe(1);
            expect(c.element.children("#entry1").children(".x-list-item-body").text()).toBe("text1");
            expect(c.element.children("#entry2").children(".x-list-item-body").children("#span2").length).toBe(1);
            expect(c.element.children("#entry2").children(".x-list-item-body").text()).toBe("text2");
        });
    });

    describe("grouped-list", function() {
        it("it should wrap the content in a scroll div if scrolling is enabled", function() {
            var c = testutils.compileAndRender('<st:grouped-list scroll="true"><div id="someContent"></div></st:grouped-list>');
            var someContent = c.element.children(".x-scroller").children("#someContent");
            expect(someContent.length).toBe(1);
        });
        it("it should not wrap the content in a scroll div if scrolling is disabled", function() {
            var c = testutils.compileAndRender('<st:grouped-list scroll="false"><div id="someContent"></div></st:grouped-list>');
            var someContent = c.element.children("#someContent");
            expect(someContent.length).toBe(1);
        });
        it("should scroll be default", function() {
            var c = testutils.compileAndRender('<st:grouped-list><div id="someContent"></div></st:grouped-list>');
            expect(c.element.children(".x-scroller").length).toBe(1);
        });
        it("should add x-list-group class to all groups", function() {
            var c = testutils.compileAndRender('<st:grouped-list scroll="false"><div id="group1"/><div id="group2"/></st:grouped-list>');
            expect(c.element.children("#group1").hasClass("x-list-group")).toBeTruthy();
            expect(c.element.children("#group2").hasClass("x-list-group")).toBeTruthy();
        });
        it("should wrap the entries of all groups into a div with x-list-group-items class", function() {
            var c = testutils.compileAndRender('<st:grouped-list scroll="false"><div id="group1"><div id="entry1"/></div><div id="group2"><div id="entry2"/></div></st:grouped-list>');
            expect(c.element.children("#group1").children(".x-list-group-items").children("#entry1").length).toBe(1);
            expect(c.element.children("#group2").children(".x-list-group-items").children("#entry2").length).toBe(1);
        });
        it("should add x-list-item class to all entries of all groups", function() {
            var c = testutils.compileAndRender('<st:grouped-list scroll="false"><div id="group1"><div id="entry1"/></div><div id="group2"><div id="entry2"/></div></st:grouped-list>');
            expect(c.element.find("#entry1").hasClass("x-list-item")).toBeTruthy();
            expect(c.element.find("#entry2").hasClass("x-list-item")).toBeTruthy();
        });
        it("should wrap the children of all entries of all groups into a div with x-list-item-body class", function() {
            var c = testutils.compileAndRender('<st:grouped-list scroll="false"><div id="group1"><div id="entry1">text1<span id="span1"/></div><div id="entry2">text2<span id="span2"/></div></div></st:grouped-list>');
            expect(c.element.find("#entry1").children(".x-list-item-body").children("#span1").length).toBe(1);
            expect(c.element.find("#entry1").children(".x-list-item-body").text()).toBe("text1");
            expect(c.element.find("#entry2").children(".x-list-item-body").children("#span2").length).toBe(1);
            expect(c.element.find("#entry2").children(".x-list-item-body").text()).toBe("text2");
        });
        it("should add the group attribute of groups as a h3 child", function() {
            var c = testutils.compileAndRender('<st:grouped-list scroll="false"><div id="group1" group="g1"/><div id="group2" group="g2"/></st:grouped-list>');
            expect(c.element.find("#group1").children("h3").hasClass("x-list-header")).toBeTruthy();
            expect(c.element.find("#group1").children("h3").text()).toBe("g1");
            expect(c.element.find("#group1").attr("group")).toBeUndefined();
            expect(c.element.find("#group2").children("h3").hasClass("x-list-header")).toBeTruthy();
            expect(c.element.find("#group2").children("h3").text()).toBe("g2");
            expect(c.element.find("#group2").attr("group")).toBeUndefined();
        });

    });

    describe('st:selected', function() {
        it("should add x-item-selected if selected", function() {
            var c = testutils.compileAndRender('<st:textfield name="someProp" st:selected="selected"></st:textfield>');
            var scope = c.scope;
            scope.selected = true;
            scope.$eval();
            expect(c.element.hasClass("x-item-selected")).toBeTruthy();
            scope.selected = false;
            scope.$eval();
            expect(c.element.hasClass("x-item-selected")).toBeFalsy();

        });
    });

    describe("angular.Array.groupBy", function() {
        it("should work for empty lists", function() {
            expect(angular.Array.groupBy([], "someProperty")).toEqual([]);
        });
        it("should group the entries by the given property", function() {
            var input = [{title: "aaa", name: "n1"}, {title: "aaa", name: "n2"}, {title: "baa", name: "n3"}];
            var groupedList = angular.Array.groupBy(input, "title");
            expect(groupedList.length).toBe(2);
            expect(groupedList[0].group).toBe("aaa");
            expect(groupedList[0].entries).toEqual([{title: "aaa", name: "n1"}, {title: "aaa", name: "n2"}]);
            expect(groupedList[1].group).toBe("baa");
            expect(groupedList[1].entries).toEqual([{title: "baa", name: "n3"}]);
        });
        it("should group the entries by the given property and the given length", function() {
            var input = [{title: "aaa", name: "naaa"}, {title: "aab", name: "naab"}, {title: "baa", name: "nbaa"}];
            var groupedList = angular.Array.groupBy(input, "title", 2);
            expect(groupedList.length).toBe(2);
            expect(groupedList[0].group).toBe("aa");
            expect(groupedList[0].entries).toEqual([{title: "aaa", name: "naaa"}, {title: "aab", name: "naab"}]);
            expect(groupedList[1].group).toBe("ba");
            expect(groupedList[1].entries).toEqual([{title: "baa", name: "nbaa"}]);
        });
    });
});
