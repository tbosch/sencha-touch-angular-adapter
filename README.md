Sencha Touch Mobile Angular Adapter
=====================

Description
-------------

Integration between sencha touch and angular.js. Provides an html markup and compile integration as both
frameworks modify the dom. This integration is very general, so almost all widgets should work out-of-the-box!

Furthermore provides special enhancements useful for mobile applications.

Note that this just needs angular and sencha touch as dependencies, but no jquery, dojo, ...

Please also see [jquery-mobile-angular-adapter](https://github.com/tigbro/jquery-mobile-angular-adapter).

Missing parts / Restrictions
------------
- Due to the nature of angular this is intended to be used WITHOUT the Sencha Touch stores.
  Please use `ng:repeat` instead.
- Due to their direct link to Stores a new list and grouped-list widget was created that just displays
  it`s content.

Some parts are still missing:

- Enabled/Disabled-Handling: This would be just a directive like `st:enabled` that calls Ext.Component.setEnabled().
- Validation Markers: If a validation fails, how does Sencha notify this to the user?
- Radiogroups: Does not yet return the correct value in databinding.
- Selectfields: Does not work yet. This would be a subtag like `<st:option key="asdf" value="asdf">`
  that can be used with `ng:repeat`.
- Paged Lists: This will be the same concept as in the jquery-mobile-angular-adapter.
- Ext.Router is not yet supported. Do we need this?
- list and grouped-list do not yet support automatically marking pressed items and the indexbar at the right.

Sample
------------
- Js fiddle [Todo mobile with sencha touch](http://jsfiddle.net/tigbro/xVBRE/).
- This project is a Maven-Project. Start it with mvn jetty:start and go to [localhost:8080/stng/demo](localhost:8080/stng/demo)


Usage
---------

Include this adapter _after_ angular and sencha tuch (see below).

ATTENTION: Do NOT use the `autobind` mode of angular!


    <html xmlns:ng="http://angularjs.org" xmlns:ngm="http://jqm-angularjs.org">
    <head>
        <link rel="stylesheet" href="lib/sencha-touch.css"/>

        <script src="lib/angular-0.9.19.js"></script>
        <script src="lib/sencha-touch-1.1.0.js"></script>
        <script src="lib/sencha-touch-angular-adapter-0.9.0.js"></script>
    </head>


Build
--------------------------
The build is done using maven and requirejs.

- `mvn clean package -Pbuild`: This will create a new version of the adapter and put it into `/compiled`.

Please install the latest version of the maven plugin `brew`. This project provides a
snapshot release in `/localrepo`.

Running the tests (No tests yet!!)
-------------------

- `mvn clean integration-test -Ptest`: This will do a build and execute the tests using js-test-driver.
  The browser that is used can be specified in the pom.xml.
- `mvn clean package jetty:run`: This will start a webserver under `localhost:8080/jqmng`.
  The unit-tests can be run via the url `localhost:8080/jqmng/UnitSpecRunner.html`
  The ui-tests can be run via the url `localhost:8080/jqmng/UiSpecRunner.html`

Directory layout
-------------------
This follows the usual maven directory layout:

- src/main/webapp: The production code
- src/test/webapp: The test code
- compiled: The result of the javascript compilation


Compile Integration and Syntax
-----------------
This uses the following syntax for declaring sencha widgets in a page:

    <st:panel option1="value1" ...>
      ... child widgets ...
    </st:panel>

The element name `st:<type>` defines the sencha touch widget name. The other options on the element are arguments for the constructor
of that widget with the following syntax:
- Dashed to camelCase translation: As html attributes are case insensitive in some browsers, the translates
  attribute names with dashes like `part1-part2` into camelCase attributes like `part1Part2`.
- Deep object as configuration: Sencha often takes whole objects as configuration options. This can be set with attribute names that include a dot.
  E.g. `layout.index="test"` will create an object that contains the property `index` and the value `test`.
- Automatic value conversion: Some Sencha Properties properties require ints or booleans. The value will be automatically
  converted into ints or boolean if they can be converted into those types.

Child widgets within other widgets are automatically added to the parent widget. If the child widget contains the
attribute `dock` then the function `Container.addDocked` is used, otherwise `Contianer.add`.

The elements in the dom will be injected into the sencha components. So if you add a css class or style to an element,
this will apply to the widget of that element.

Angular markup like `{{}}` can be used for all attributes. If the sencha components takes such an attribute and renders
some children with it (e.g. the button widget adds the attribute `text`  as text-child in the dom) those children
will also be automatically be updated by angular. E.g. a `<st:button text="{{name}}">` work well when the
name property in the angular scope is updated!

The angular widget `ng:repeat` can be used for all widgets and works very well for automatically creating or destroying
widgets.

The compilation integration is as following:
1. Angular is asked to compile to top level elements down unto the first `<st:mytype...>`.
2. A sencha widget is created for that element and connected to the dom element of the element.
3. The sencha widget is asked to render itself
4. After the rendering of the sencha widget angular is called (recursively) to compile the children of
   the sencha widget. By this, angular markup that was rendered by the sencha widget gets bound by angular.
5. After the child widgets are completed with compilation, the next top level `<st:...>` is compiled.

This means that we are compiling the widgets for every depths of `<st:...>`s with a separate
call to angulars compiler.


Syntax, Widgets, Directives and Services
-----------

### <meta name="prop" content="value">
Alle meta tags given to `Ext.Application` as initialization parameters. The attributes are converted
with the same rules that apply to the attributes of widgets.


### `<st:custom>`
This widget just takes all child elements and wraps them into a sencha component. By this, custom html can be displayed.


### `<st:simple-list>`
As we are not using stores any more, the list component was recreated. Usage:

    <st:simple-list>
        <div ng:repeat="item in items">
            {{item.name}}
        </div>
    </st:simple-list>

The widget creates for every child `<div>` a list entry. That `<div>` can have abritary html content.

### `<st:simple-grouped-list>`
Grouped list component. Usage:

    <st:simple-grouped-list>
        <div group="{{group.key}}" ng:repeat="group in groups()">
            <div ng:repeat="item in group.items">
                {{item.name}}
            </div>
        </div>
    </st:simple-grouped-list>

The widget creates for every child `<div>` a group entry with the heading of the `group` attribute.
All child `<div>`s of those groups are then styled as normal list entry.
That `<div>` within the list entries can have abritary html content.

### Input components like `textfield` ...
Those components can be bound, just like usual in angular, via the `name` attribute. This does bidirectional databinding.

### Directive `st:selected="expression"`
Marks those elements for which the expression evaluates to true with the css class that is used in sencha
for selected list entries.

### Directive `st:event="{event1:'handler1',event2:'handler2',...}"`
Central directive for event-handling. The event names can either be event names of sencha widgets (e.g. `activated` for panels),
but also generic events like `tap`, ... that are available for all elements.
Note that the widget events are only available if the directive is added to an `<st:...>` element
that declares a sencha component.

### Widget `st:if="expression"`
This widget renders an element only if the expression evaluates to true.

### Service $waitDialog
This service has two functions:
- `show(msg)`: Shows the wait dialog with the given message
- `hide()`: Hides the wait dialog.

### Angular Service $show(id) and $hide(id)
This service calls the show resp. hide function on the the sencha component that belongs to the dom element with the given id.
Useful for dialogs.

### Angular Service $navigate('[transition]:componentId')
This service calls the setActiveItem` function on the the sencha component that belongs to the dom element with the given id.
Useful for TabPanels, Carousels and panels with card layout.
- The transition may be omitted, e.g. `$navigate('homepage')`.

### Function angular.Object.navigate / $navigate
Every expression can now use the `$navigate` expression to define the navigation outside of the controlers
in the html pages. By this, the controllers stay independent of the navigation process and is reusable.

There are two types of syntax:
1. `$activate(target)`: Navigates to the given target using the `$navigate` service, so the target can also
   include a transition.
2. `$activate(test,'outcome1:target','outcome2:target',...)`: Navigates to that target whose outcome equals
   to the test. The special outcomes `success` is applied for any value for `test` that is not `false` (e.g. also `undefined`),
   and the outcome `failure` is used for the value `false` of test.
   This also supports promises. In that case, the navivation is done with the first argument of
   the `done` / `fail` callback of the promise. Also, the `success` outcome is mapped to the `done` callback
   and the `failure` outcome to the `fail` callback.





