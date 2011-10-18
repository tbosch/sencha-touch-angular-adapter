angular.service('todoStore', function(jsonp, waitDialog) {
    var readUrl = 'https://secure.openkeyval.org/';
    var writeUrl = 'https://secure.openkeyval.org/store/?';

    function read(key, success) {
        waitDialog.show('Please wait');
        jsonp('JSON', readUrl + key + '?callback=JSON_CALLBACK', function(status, data) {
            success(data);
            waitDialog.hide();
        }, function(status) {
            success([]);
            waitDialog.hide();
        });
    }

    function write(key, value) {
        waitDialog.show('Please wait');
        value = encodeURIComponent(JSON.stringify(value));
        jsonp('JSON', writeUrl + key + '=' + value + '&callback=JSON_CALLBACK', function() {
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

function TodoController(todoStore) {
    this.store = todoStore;
    this.todos = [];
    this.inputText = '';
    this.storageKey = 'SenchaTouchAngularTodoapp';
}

TodoController.$inject = ['todoStore'];

TodoController.prototype = {
    addTodo: function() {
        this.todos.push({
            name: this.inputText,
            done: false
        });
        this.inputText = '';
    },
    refreshTodos: function() {
        var self = this;
        this.store.read(this.storageKey, function(data) {
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
        this.store.write(this.storageKey, this.todos);
    }
};
