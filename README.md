Sencha Touch Mobile Angular Adapter
=====================

Description
-------------

Integration between sencha touch and angular.js. Provides an html markup and compile integration as both
frameworks modify the dom.

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
- Js fiddle [Todo mobile](http://jsfiddle.net/Du2DY/3/).
- This project is a Maven-Project. Start it with mvn jetty:start and go to [localhost:8080/stng/demo](localhost:8080/stng/demo)


Usage
---------

Include this adapter _after_ angular and jquery mobile (see below).

ATTENTION: Do NOT use the `autobind` mode of angular!


    <html xmlns:ng="http://angularjs.org" xmlns:ngm="http://jqm-angularjs.org">
    <head>
        <title>MobileToys</title>
        <link rel="stylesheet" href="lib/jquery.mobile-1.0b1-oc1.css"/>
        <script src="lib/jquery-1.6.1.js"></script>
        <script src="lib/jquery.mobile-1.0b1-oc1.js"></script>
        <script src="lib/angular-0.9.15.js"></script>
        <script src="lib/jquery-mobile-angular-adapter.js"></script>
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


Widgets, Directives and Services
-----------

### Directive ngm:click(handler)





