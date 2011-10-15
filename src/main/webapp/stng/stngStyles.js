define(['angular'], function() {
    /* Special styles for sencha-touch-angular-adapter */
    /* Set block display for spacer. Needed due to our custom tags */
    var styles =
        ".st-spacer {display: block}";
    angular.element(document).find('head').append('<style type=\"text/css\">' + styles + '</style>');
});