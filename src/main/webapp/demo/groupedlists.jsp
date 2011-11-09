<st:panel title="Grouped lists" id="grouped-lists" ng:controller="ListController" scroll="true">

    <st:fieldset title="Select text in list">
        <st:textfield name="selectedName" place-holder="enter text to select entries in the list"></st:textfield>
    </st:fieldset>
    <st:fieldset title="Grouped list">
        <st:panel layout.type="hbox" layout.align="stretch">
            <st:textfield name="insertText" flex="1" place-holder="text for new entry"
                          st:event="{action: 'addItem()'}"></st:textfield>
            <st:button text="Add" st:event="{tap:'addItem()'}"></st:button>
            <st:button text="Clear" st:event="{tap:'clearItems()'}"></st:button>
        </st:panel>
        <st:grouped-list scroll="false">
            <div group="{{group.group}}" ng:repeat="group in items.$groupBy('name',1)">
                <div ng:repeat="item in group.entries" st:event="{tap:'itemTap(item)'}" st:selected="isSelected(item)">
                    {{item.name}}
                </div>
            </div>
        </st:grouped-list>
    </st:fieldset>
</st:panel>
