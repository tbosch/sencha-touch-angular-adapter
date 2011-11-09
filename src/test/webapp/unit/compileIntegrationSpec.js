define(['unit/testutils', 'stng/compileIntegration'], function(testutils, compileIntegration) {

    describe('compileIntegration', function() {
        describe('attributes of sencha tags', function() {
            it("should be used as constructor properties", function() {
                var c = testutils.compileAndRender('<st:button someprop="someValue"></st:button>');
                expect(c.widget.someprop).toBe("someValue");
            });
            it("should be converted from dashed to camelCase", function() {
                var c = testutils.compileAndRender('<st:button some-prop="someValue"></st:button>');
                expect(c.widget.someProp).toBe("someValue");
            });
            it("should auto convert booleans", function() {
                var c = testutils.compileAndRender('<st:button some-prop="true"></st:button>');
                expect(c.widget.someProp).toBe(true);
            });
            it("should auto convert ints", function() {
                var c = testutils.compileAndRender('<st:button some-prop="1"></st:button>');
                expect(c.widget.someProp).toBe(1);
            });
            it("should set deep properties using dot notation", function() {
                var c = testutils.compileAndRender('<st:button some-prop.some-child="someValue"></st:button>');
                expect(c.widget.someProp.someChild).toBe("someValue");
            });
            it("should remove attributes from the dom", function() {
                var c = testutils.compileAndRender('<st:button someprop="someValue"></st:button>');
                expect(c.widget.someprop).toBe("someValue");
                expect(c.element.attr('someprop')).toBeUndefined();
            });
        });

        describe("override sencha widgets", function() {
            it("should use the ng-prefixed version instead of the normal version", function() {
                var someWidgetClass = Ext.extend(Ext.AngularComponent, {});
                var someNgWidgetClass = Ext.extend(Ext.AngularComponent, {});
                Ext.reg('some-widget', someNgWidgetClass);
                Ext.reg('ng-some-widget', someNgWidgetClass);
                compileIntegration.registerWidgets();
                var c = testutils.compileAndRender('<st:some-widget></st:some-widget>');
                expect(c.widget.xtype).toBe("ng-some-widget");
            });
        });

        it("should integrate attributes with {{}} markup into the rendered html as spans", function() {
            var c = testutils.compileAndRender('<st:button text="{{someProp}}"></st:button>');
            c.scope.someProp = 'hallo';
            c.scope.$eval();
            var spans = c.element.children('span');
            expect(spans.text()).toBe(c.scope.someProp);
        });
        it("should keep css classes defined at the sencha tags", function() {
            var c = testutils.compileAndRender('<st:textfield class="someClass" name="someProp"></st:textfield>');
            expect(c.element.hasClass('someClass'));
        });

        it("should add childs to parent containers", function() {
            var c = testutils.compileAndRender('<st:panel><st:textfield name="someProp"></st:textfield></st:panel>');
            expect(c.widget.items.length).toBe(1);
            expect(c.widget.items.get(0).xtype).toBe("textfield");
        });

        it("should add childs with dock attribute to parent containers as docked", function() {
            var c = testutils.compileAndRender('<st:panel><st:textfield name="someProp" dock="true"></st:textfield></st:panel>');
            expect(c.widget.items.length).toBe(0);
            expect(c.widget.dockedItems.length).toBe(1);
            expect(c.widget.dockedItems.get(0).xtype).toBe("textfield");
        });
        it("should not add floating childs to parent containers", function() {
            var c = testutils.compileAndRender('<st:panel><st:textfield name="someProp" floating="true"></st:textfield></st:panel>');
            expect(c.widget.items.length).toBe(0);
            expect(c.widget.dockedItems.length).toBe(0);
        });

        describe("repeat", function() {
            it("should insert new elements with ng:repeat at the original position", function() {
                var c = testutils.compileAndRender('<st:panel><st:textfield name="someProp" class="first"></st:textfield>' +
                    '<st:textfield name="someProp2" class="middle" ng:repeat="i in list"></st:textfield>' +
                    '<st:textfield name="someProp3" class="last"></st:textfield></st:panel>');
                var items = c.widget.items;
                expect(items.length).toBe(2);
                expect(items.get(0).el.hasCls("first")).toBeTruthy();
                expect(items.get(1).el.hasCls("last")).toBeTruthy();
                c.scope.list = [1];
                c.scope.$eval();
                var items = c.widget.items;
                expect(items.get(0).el.hasCls("first")).toBeTruthy();
                expect(items.get(1).el.hasCls("middle")).toBeTruthy();
                expect(items.get(2).el.hasCls("last")).toBeTruthy();
                c.scope.list = [1,2];
                c.scope.$eval();
                var items = c.widget.items;
                expect(items.get(0).el.hasCls("first")).toBeTruthy();
                expect(items.get(1).el.hasCls("middle")).toBeTruthy();
                expect(items.get(2).el.hasCls("middle")).toBeTruthy();
                expect(items.get(3).el.hasCls("last")).toBeTruthy();
            });
            it("should destroy sencha widgets when the element is removed", function() {
                var c = testutils.compileAndRender('<st:panel>' +
                    '<st:textfield name="someProp" ng:repeat="i in list"></st:textfield>' +
                    '</st:panel>');
                c.scope.list = [1];
                c.scope.$eval();
                var widget = c.widget.items.get(0);
                expect(widget.isDestroyed).toBeFalsy();
                c.scope.list = [];
                c.scope.$eval();
                expect(widget.isDestroyed).toBeTruthy();
            });
        });
    });
});