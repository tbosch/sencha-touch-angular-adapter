define(['angular'], function(angular) {
    var globalScope;
    var createCallbacks = [];
    function create() {
        globalScope = angular.scope();
        for (var i=0; i<createCallbacks.length; i++) {
            createCallbacks[i].call(this, globalScope);
        }
        return globalScope;
    }

    function onCreate(callback) {
        createCallbacks.push(callback);
    }
    return {
        create: create,
        onCreate: onCreate
    }
});