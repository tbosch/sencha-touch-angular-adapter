define(['ext'], function(Ext) {
// Bugfix for tabpanel
// Don't know why: Tabpanel needs an initial item
// so that the tabbar is shown. Otherwise the tabbar
// will never show up!
    Ext.FixedTabPanel = Ext.extend(Ext.TabPanel, {
        constructor : function(config) {
            if (!config.items || config.items.length == 0) {
                config.items = [
                    {title: 'test'}
                ];
                var res = Ext.FixedTabPanel.superclass.constructor.call(this, config);
                this.remove(this.items.getAt(0));
                return res;
            } else {
                return Ext.FixedTabPanel.superclass.constructor.call(this, config);
            }
        }
    });
    Ext.reg('tabpanel', Ext.FixedTabPanel);
});