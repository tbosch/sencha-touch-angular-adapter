<script>
    function ToolbarsController() {
        this.clicked = function() {
            alert("clicked");
        }
    }
</script>

<st:panel title="Toolbars" id="toolbars" ng:controller="ToolbarsController" scroll="true">
    <st:toolbar dock="top">
        <st:button text="Clickme Top" st:event="{tap:'clicked()'}"></st:button>
    </st:toolbar>
    <st:panel>
    </st:panel>
    <st:toolbar dock="bottom">
        <st:button text="Clickme Bottom" st:event="{tap:'clicked()'}"></st:button>
    </st:toolbar>
</st:panel>
