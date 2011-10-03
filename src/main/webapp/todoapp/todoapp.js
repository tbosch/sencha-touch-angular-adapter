angular.service('todoStore', function(jsonp, waitDialog) {
    var readUrl = 'https://secure.openkeyval.org/';
    var writeUrl = 'https://secure.openkeyval.org/store/?';
    var _storageKey = 'JQueryMobileAngularTodoapp';

    function read(success) {
        waitDialog.show('Please wait');
        jsonp('JSON', readUrl + _storageKey + '?callback=JSON_CALLBACK', function(status, data) {
            success(data);
            waitDialog.hide();
        });
    }

    function write(value) {
        waitDialog.show('Please wait');
        value = encodeURIComponent(JSON.stringify(value));
        jsonp('JSON', writeUrl + _storageKey + '=' + value + '&callback=JSON_CALLBACK', function() {
            waitDialog.hide();
        });
    }

    function storageKey(key) {
        if (key) {
            _storageKey = key;
        }
        return _storageKey;
    }

    return {
        read: read,
        write: write,
        storageKey: storageKey
    }

}, {
    $inject: ['$xhr', '$waitDialog']
});

function TodoController(todoStore, activate) {
    this.store = todoStore;
    this.activate = activate;
    this.todos = [];
    this.inputText = '';
}

TodoController.$inject = ['todoStore', '$activate'];

TodoController.prototype = {
    showSettings: function() {
        this.activate("settings", "slide");
    },
    addTodo: function() {
        this.todos.push({
            name: this.inputText,
            done: false
        });
        this.inputText = '';
    },
    refreshTodos: function() {
        var self = this;
        this.store.read(function(data) {
            if (!data) {
                data = [];
            }
            self.todos = data;
        });
    },
    saveTodos: function() {
        // delete all checked todos
        var newTodos = angular.Array.filter(this.todos, function(todo) {
            return !todo.done;
        });
        this.todos = newTodos;
        this.store.write(this.todos);
    },
    onActivate: function() {
        this.refreshTodos();
    }
}

function SettingsController(todoStore, activate) {
    this.activate = activate;
    this.todoStore = todoStore;
}

SettingsController.$inject = ['todoStore', '$activate'];


SettingsController.prototype = {
    onActivate: function() {
        this.storageKey = this.todoStore.storageKey();
    },
    onPassivate: function() {
        this.todoStore.storageKey(this.storageKey);
    },
    back: function() {
        this.activate("todos", "slide");
    }
}