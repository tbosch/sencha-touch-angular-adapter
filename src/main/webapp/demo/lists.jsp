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

<div st:xtype="panel" title="Lists" id="lists" ng:controller="ListController" scroll="true">

    <div st:xtype="textfield" name="selectedName" label="Selected text"></div>
    <div st:xtype="panel" layout.type="hbox" layout.align="stretch">
        <div st:xtype="textfield" name="insertText" flex="1"></div>
        <div st:xtype="button" text="Add" st:event="tap:addItem()"></div>
    </div>
    <div st:xtype="custom" >
        <p>
            Normal List:
        </p>
    </div>
    <div st:xtype="list" scroll="false">
        <div ng:repeat="item in items" st:selected="isSelected(item)" st:event="tap:itemTap(item)">
            {{item.name}}
        </div>
    </div>


    <div st:xtype="custom">
        <p>
            Grouped List:
        </p>
    </div>

    <div st:xtype="grouped-list" scroll="false">
        <div group="{{group.key}}" ng:repeat="group in groups()">
            <div ng:repeat="item in group.items" st:event="tap:itemTap(item)" st:selected="isSelected(item)">
                {{item.name}}
            </div>
        </div>
    </div>
</div>
