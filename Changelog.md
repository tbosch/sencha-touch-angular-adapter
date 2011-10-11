Changelog
=====================

0.9.2
-------------
All attributes on sencha widgets (`<st:xxx>`) that do not contain a namespace (e.g. ng:controller, ...) are
now removed from the dom, as they only serve as input attributes to sencha touch. By this, the dom stays small.
The options that are used to create the sencha widget are appended as a comment within every sencha widget tag.

The application requires the meta tag `<meta name="auto-start" content="true">` to be present.
This is needed to prevent initialization during unit tests.

`<st:list>` -> `<st:simple-list>`
`<st:grouped-list>` -> `<st:simple-grouped-list>`



0.9.1
-------------
- Update the syntax to use elements instead of the st:xtype attribute


0.9.0
-------------
- Initial release, incomplete
