define(['ext', 'angular'], function(Ext, angular) {
    var loadDialog;
    var defaultMessage = 'Please wait...';

    /**
     *
     * @param msg (optional)
     */
    function show(msg) {
        if (!msg) {
            msg = defaultMessage;
        }
        loadDialog = new Ext.LoadMask(Ext.getBody(), {msg:msg});
        loadDialog.show();
    }

    function hide() {
        loadDialog.hide();
    }

    var res = {
        show: show,
        hide: hide
    };
    angular.service('$waitDialog', function() {
        return res;
    });
    return res;

});