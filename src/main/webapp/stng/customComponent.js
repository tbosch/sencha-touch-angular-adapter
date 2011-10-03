define(['ext', 'stng/util'], function(Ext, util) {
    var $ = util.jqLite;

    /**
     * A component that allows custom html children
     */
    Ext.AngularComponent = Ext.extend(Ext.Component, {
        children: undefined,

        onRender : function() {
            this.children = $(this.el.dom).children();
            Ext.AngularComponent.superclass.onRender.apply(this, arguments);
        },

        initContent: function() {
            // Move the children below the targetEl.
            // This is needed e.g. for scrolling.
            // Note that a container does this automatically by using
            // the layouts for his children components.
            var target = $(this.getTargetEl().dom);
            target.append(this.children);
        }
    });

    Ext.reg('custom', Ext.AngularComponent);
});