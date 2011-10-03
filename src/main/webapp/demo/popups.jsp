<script>
    function TestController(activate, show, hide) {
        this.counter = 0;
        this.items = [
            {name: 'Hallo'},
            {name: 'Du'},
            {name: 'da'}
        ];
        this.isSelected = function(item) {
            return item.name === 'Du';
        }
        this.onActivate = function(id) {
            console.log("activated " + id);
        }
        this.onDeactivate = function(id) {
            console.log("deactivated " + id);
        }
        this.page = function(page) {
            activate(page, 'slide');
        }
        this.showPopup = function(id) {
            show(id);
        }
        this.hidePopup = function(id) {
            hide(id);
        }
        this.doClick = function() {
            console.log('clicked');
        }
        this.onItemTap = function() {
            console.log('hallo');
        }
        this.addItem = function() {
            this.items.push({name: 'New Item'});
            this.counter ++;
        },
        this.log = function(msg) {
            console.log(msg);
        }
    }

</script>
<div st:xtype="panel" centered="true" hide-on-mask-tap="false" floating="true" scroll="true" modal="true" title="Panel1" id="popup1"
     st:event="show:onActivate('popup1'),hide:onDeactivate('popup1')">
    <div st:xtype="toolbar" dock="bottom">
        <div st:xtype="button" text="Hide" st:event="tap:hidePopup('popup1')"></div>
    </div>
    <div st:xtype="button" text="Btn1"></div>
    <div st:xtype="button" text="Btn2"></div>

    <div st:xtype="textfield" name="test"></div>
    <div st:xtype="textfield" name="test"></div>
</div>

    <div st:xtype="panel" title="Panel1" id="page1" st:event="beforeactivate:onActivate('page1'),beforedeactivate:onDeactivate('page1')">
        <div st:xtype="toolbar" dock="top">
            <div st:xtype="button" text="Page2" st:event="tap:page('page2')"></div>
            <div st:xtype="button" text="Popup" st:event="tap:showPopup('popup1')"></div>
            <div st:xtype="button" text="Back" st:event="tap:page('back')"></div>
            <div st:xtype="button" text="Sheet" st:event="tap:showPopup('sheet1')"></div>
        </div>

        <div st:xtype="list">
            <div ng:repeat="item in items" st:selected="isSelected(item)">
                {{item.name}}
            </div>
        </div>

        <div st:xtype="button" st:event="tap:addItem()" text="{{counter}}Add new Item"></div>
        <div st:xtype="button" ng:repeat="item in items" text="Add Item"></div>

        <div st:xtype="grouped-list" ng:if="!deleted" st:event="containertap:log('containertap')">
            <div group="{{1+2}}">
                <div st:event="tap:onItemTap()">
                    a1
                </div>
                <div>
                    a2
                </div>
            </div>
            <div group="B">
                <div>
                    b1
                </div>
                <div>
                    b2
                </div>
            </div>

        </div>
        <div st:xtype="sheet" id="sheet1">
            <div st:xtype="button" dock="top" text="Button1" st:event="tap:hidePopup('sheet1')"></div>
        </div>
    </div>

    <div st:xtype="panel" title="Panel2" id="page2" st:event="beforeactivate:onActivate('page2'),beforedeactivate:onDeactivate('page2')">
        <div st:xtype="toolbar" dock="top">
            <div st:xtype="button" text="Page1" st:event="tap:page('page1')"></div>
            <div st:xtype="button" text="Back" st:event="tap:page('back')"></div>
        </div>
        <div st:xtype="textfield" name="test"></div>
    </div>
