define(['angular', 'ext', 'stng/util'], function(angular, Ext, util) {
    var $ = util.jqLite;

    var afterEvalQueue = [];

    function executeAfterEvalQueue() {
        while (afterEvalQueue.length > 0) {
            var callback = afterEvalQueue.shift();
            callback();
        }
    }

    function afterEval(callback) {
        afterEvalQueue.push(callback);
    }

    function isConnectedToDocument(element) {
        var rootElement = document.documentElement;
        while (element !== null && element !== rootElement) {
            element = element.parentNode;
        }
        return element === rootElement;
    }

    function destroyNotConnectedWidgets() {
        var widget;
        var widgets = Ext.ComponentMgr.all.getValues();
        for (var i = 0; i < widgets.length; i++) {
            widget = widgets[i];
            if (widget.el && widget.el.dom) {
                if (!isConnectedToDocument(widget.el.dom)) {
                    widget.destroy();
                }
            }
        }
    }

    function compilePage() {
        var element = $(document.getElementsByTagName("body"));
        var scope = angular.compile(element)();

        function refresh() {
            executeAfterEvalQueue();
            destroyNotConnectedWidgets();
        }

        scope.$onEval(99999, refresh);
        refresh();
    }

    var compileCounter = 0;
    angular.widget('@st:xtype', function(expression, compileElement) {
        compileElement.removeAttr('st:xtype');
        var compileIndex = compileCounter++;
        var type = expression;
        this.descend(false);
        this.directives(false);
        var options = util.stOptions(compileElement[0]);

        if (type === 'toolbar') {
            if (!options.dock) {
                options.dock = 'top';
            }
        }
        // TODO default für "sheet"
        // --> Alle components sollten ein "dock" haben.
        return function(element) {
            var scope = this;
            options.el = Ext.Element.get(element[0]);
            var component = Ext.create(options, type);
            util.stWidget(element, component);
            if (component) {
                component.compileIndex = compileIndex;

                function compileChildren() {
                    // TODO save the scope.$element
                    var tmpQueue = afterEvalQueue;
                    afterEvalQueue = [];
                    angular.compile(element)(scope);
                    // Executes the adding of children to the parents
                    executeAfterEvalQueue();
                    afterEvalQueue = tmpQueue;

                    afterEval(function() {
                        // Execute the layout after end of all rendering (in the top most afterEval),
                        // so that internal flags are ok,
                        // e.g. Component.hidden
                        // is set to false which would prevent doComponentLayout from doing anyhing!
                        util.layoutWithParents(component);
                    });
                }

                if (component.rendered) {
                    compileChildren();
                } else {
                    var oldInitContent = component.initContent;
                    component.initContent = function() {
                        var res = oldInitContent.apply(this, arguments);
                        compileChildren();
                        return res;
                    };

                }
            }

            afterEval(function() {
                // The parent.add is executed after the compilation of angular,
                // as only then the elements know their parents (especially for ng:repeat).
                var parent = util.nearestStWidget($(element.parent()));
                if (component && parent && !options.floating) {
                    // TODO check if the parent is container. Otherwise show an error.
                    if (options.dock) {
                        parent.addDocked(component);
                    } else {
                        // The insert index is defined by the element order in the original document.
                        // E.g. important if an element is added later via ng:repeat
                        // Especially needed as angular's ng:repeat uses $onEval to create
                        // it's children, and does not do this directly in the linking phase.
                        var insertIndex = 0;
                        while (insertIndex < parent.items.length && parent.items.getAt(insertIndex).compileIndex <= compileIndex) {
                            insertIndex++;
                        }
                        parent.add(insertIndex, component);
                    }
                }
            });
        }
    });

    return {
        afterEval: afterEval,
        compilePage: compilePage
    }

});