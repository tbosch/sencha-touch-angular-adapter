define(['stng/util', 'stng/compileIntegration'], function(util, compileIntegration) {
    var metas = document.getElementsByTagName("meta");
    var props = {};
    for (var i=0; i<metas.length; i++) {
        var meta = util.jqLite(metas[i]);
        props[meta.attr('name')] = meta.attr('content');
    }
    Ext.setup(util.stOptions(props));

    new Ext.Application({
        launch: compileIntegration.compilePage
    });
});
