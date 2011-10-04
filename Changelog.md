Changelog
=====================

0.9.2
-------------
All attributes on sencha widgets (`<st:xxx>`) that do not contain a namespace (e.g. ng:controller, ...) are
now removed from the dom, as they only serve as input attributes to sencha touch. By this, the dom stays small.
The options that are used to create the sencha widget are appended as a comment within every sencha widget tag.



0.9.1
-------------
- Update the syntax to use elements instead of the st:xtype attribute


0.9.0
-------------
- Initial release, incomplete
