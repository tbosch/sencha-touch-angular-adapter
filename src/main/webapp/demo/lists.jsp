<script>
    function groupBy(list, fn) {
        var groupsByKey = {};
        var groups = [];
        for (var i=0; i<list.length; i++) {
            var item = list[i];
            var key = fn(item);
            var group = groupsByKey[key];
            if (!group) {
                group = {key: key, items: []};
                groupsByKey[key] = group;
                groups.push(group);
            }
            group.items.push(item);
        }
        return groups;
    }

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

    <st:textfield name="selectedName" label="Selected text"></st:textfield>
    <st:panel layout.type="hbox" layout.align="stretch">
        <st:textfield name="insertText" flex="1"></st:textfield>
        <st:button text="Add" st:event="tap:addItem()"></st:button>
        <st:button text="Clear" st:event="tap:clearItems()"></st:button>
    </st:panel>
    <st:custom >
        <p>
            Normal List:
        </p>
    </st:custom>

    <st:list scroll="false">
        <div ng:repeat="item in items" st:selected="isSelected(item)" st:event="tap:itemTap(item)">
            {{item.name}}
        </div>
    </st:list>


    <st:custom>
        <p>
            Grouped List:
        </p>
    </st:custom>

    <st:grouped-list scroll="false">
        <div group="{{group.key}}" ng:repeat="group in groups()">
            <div ng:repeat="item in group.items" st:event="tap:itemTap(item)" st:selected="isSelected(item)">
                {{item.name}}
            </div>
        </div>
    </st:grouped-list>
</st:panel>
