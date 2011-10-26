define(['ext', 'angular'], function(Ext, angular) {
    var showCalls = [];

    var loadDialog;

    function updateUi() {
        if (loadDialog) {
            loadDialog.hide();
            loadDialog = null;
        }
        if (showCalls.length > 0) {
            var lastCall = showCalls[showCalls.length - 1];
            var options = {};
            if (lastCall.msg) {
                options.msg = lastCall.msg;
            }
            loadDialog = new Ext.LoadMask(Ext.getBody(), options);
            loadDialog.show();
            if (lastCall.callback) {
                loadDialog.el.select('.x-mask').on('tap', lastCall.callback);
            }
        }
    }

    /**
     *
     * @param msg (optional)
     * @param tapCallback (optional)
     */
    function show() {
        var msg, tapCallback;
        if (typeof arguments[0] == 'string') {
            msg = arguments[0];
        }
        if (typeof arguments[0] == 'function') {
            tapCallback = arguments[0];
        }
        if (typeof arguments[1] == 'function') {
            tapCallback = arguments[1];
        }

        showCalls.push({msg: msg, callback: tapCallback});
        updateUi();
    }

    function hide() {
        showCalls.pop();
        updateUi();
    }

    /**
     *
     * @param promise
     * @param msg (optional)
     */
    function waitFor(promise, msg) {
        show();
        promise.always(function() {
            hide();
        });
    }

    /**
     *
     * @param promise
     * @param cancelData
     * @param msg (optional)
     */
    function waitForWithCancel(promise, cancelData, msg) {
        show(msg, function() {
            promise.reject(cancelData);
        });
        promise.always(function() {
            hide();
        });
    }

    function hideAll() {
        showCalls = [];
        updateUi();
    }

    var res = {
        show: show,
        hide: hide,
        waitFor: waitFor,
        waitForWithCancel:waitForWithCancel,
        hideAll: hideAll
    };

    angular.service('$waitDialog', function() {
        return res;
    });

    return res;
});