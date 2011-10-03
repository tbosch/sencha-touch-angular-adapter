<!DOCTYPE html>
<html xmlns:ng="http://angularjs.org" xmlns:stng="http://sencha-touch-angular.org">
<head>
    <title>Sencha Toys</title>

    <link rel="stylesheet" href="../lib/sencha-touch.css"/>

    <script src="../lib/angular-0.9.19.js"></script>
    <script src="../lib/sencha-touch-1.1.0.js"></script>
    <script src="../lib/require.js" data-main="../st-angular"></script>
    <script src="todoapp.js"></script>

</head>
<body>

<st:carousel fullscreen="true">
    <st:panel id="todos" ng:controller="TodoController" st:event="activate:onActivate()">
        <st:toolbar dock="top" title="Todos">
            <st:button text="Save" st:event="tap:saveTodos()"></st:button>
            <st:button text="Settings" st:event="tap:showSettings()"></st:button>
        </st:toolbar>
        <st:textfield name="inputText" place-holder="enter your todo here" st:event="action:addTodo()"></st:textfield>

        <st:checkboxfield ng:repeat="todo in todos" name="todo.done" label="{{todo.name}}"></st:checkboxfield>

    </st:panel>
    <st:panel id="settings" ng:controller="SettingsController" st:event="activate:onActivate(),beforedeactivate:onPassivate()">
        <st:toolbar dock="top" title="Settings">
            <st:button text="Back" st:event="tap:back()"></st:button>
        </st:toolbar>
        <st:textfield name="storageKey" label="Store key"></st:textfield>
    </st:panel>

</st:carousel>


</body>
</html>