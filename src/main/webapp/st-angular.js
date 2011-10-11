// Wrapper module as facade for the internal modules.
define([
    'angular',
    'stng/util',
    'stng/compileIntegration',
    'stng/customComponent',
    'stng/lists',
    'stng/navigation',
    'stng/if',
    'stng/repeat',
    'stng/store',
    'stng/setup',
    'stng/events',
    'stng/waitDialog',
    'stng/input'
], function(angular, util, compileIntegration) {
    compileIntegration.registerWidgets();
    return {
    }
});