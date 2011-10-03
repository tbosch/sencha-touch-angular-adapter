<script>
    function PopupController(_show, _hide) {
        this.show = _show;
        this.hide = _hide;
    }
    PopupController.$inject = ['$show', '$hide'];

</script>

<st:panel id="popups" title="Popups" ng:controller="PopupController">
    <st:toolbar dock="top">
        <st:button text="Show Popup" st:event="tap:show('popup1')"></st:button>
        <st:button text="Show Sheet" st:event="tap:show('sheet1')"></st:button>
    </st:toolbar>

</st:panel>

