<script>
    function ListController() {
        this.insertText = '';
        this.items = [
            {name: 'Entry1'}
        ];
        this.addItem = function() {
            this.items.push({name: this.insertText});
        }
        this.clearItems = function() {
            this.items = [];
        }
        this.containerTap = function() {
            this.items = [];
        }
        this.itemTap = function(item) {
            item.name += ' tapped';
        }
        this.groups = function() {
            return groupBy(this.items, function(item) {
                return item.name.charAt(0);
            });
        }
        this.isSelected = function(item) {
            return item && item.name == this.selectedName;
        }
    }

</script>

<st:panel title="Lists" id="lists" ng:controller="ListController" scroll="true">
    <st:fieldset title="Select text in list">
        <st:textfield name="selectedName" place-holder="enter text to select entries in the list"></st:textfield>
    </st:fieldset>
    <st:fieldset title="Plain list">
        <st:panel layout.type="hbox" layout.align="stretch">
            <st:textfield name="insertText" flex="1" place-holder="text for new entry"
                          st:event="{action: 'addItem()'}"></st:textfield>
            <st:button text="Add" st:event="{tap:'addItem()'}"></st:button>
            <st:button text="Clear" st:event="{tap:'clearItems()'}"></st:button>
        </st:panel>
        <st:list scroll="false">
            <div ng:repeat="item in items" st:selected="isSelected(item)" st:event="{tap:'itemTap(item)'}">
                {{item.name}}
            </div>
        </st:list>
    </st:fieldset>
</st:panel>
