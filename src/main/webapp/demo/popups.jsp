<script>
    function PopupController(_show, _hide) {
        this.show = _show;
        this.hide = _hide;
    }
    PopupController.$inject = ['$show', '$hide'];

</script>

<div st:xtype="panel" id="popups" title="Popups" ng:controller="PopupController">
    <div st:xtype="toolbar" dock="top">
        <div st:xtype="button" text="Show Popup" st:event="tap:show('popup1')"></div>
        <div st:xtype="button" text="Show Sheet" st:event="tap:show('sheet1')"></div>
    </div>

</div>

