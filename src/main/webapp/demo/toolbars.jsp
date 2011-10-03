<script>
    function ToolbarsController() {
        this.clicked = function() {
            alert("clicked");
        }
    }
</script>

<div st:xtype="panel" title="Toolbars" id="toolbars" ng:controller="ToolbarsController" scroll="true">
    <div st:xtype="toolbar" dock="top">
        <div st:xtype="button" text="Clickme Top" st:event="tap:clicked()"></div>
    </div>
    <div st:type="panel">
        <div st:xtype="button" text="hallo" flex="1">
        </div>
        <div st:xtype="custom">
            Hallo
        </div>
        <div st:xtype="custom" flex="1">
            Hallo2
        </div>
    </div>
    <div st:xtype="toolbar" dock="bottom">
        <div st:xtype="button" text="Clickme Bottom" st:event="tap:clicked()"></div>
    </div>
</div>
