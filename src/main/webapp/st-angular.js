// Wrapper module as facade for the internal modules.
define([
    'angular',
    'stng/util',
    'stng/compileIntegration',
    'stng/customComponent',
    'stng/lists',
    'stng/navigation',
    'stng/if',
    'stng/paging',
    'stng/repeat',
    'stng/settings',
    'stng/events',
    'stng/waitDialog',
    'stng/input',
    'stng/stngStyles',
    'stng/sharedController',
    'stng/disabled'
], function(angular, util, compileIntegration) {
    compileIntegration.registerWidgets();
    return {
    }
});