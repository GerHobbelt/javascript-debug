Debug
=====

#### A simple wrapper for Console.log ####

This code provides a simple wrapper for the console's logging methods, 
and was created to allow a very easy-to-use, cross-browser logging solution,
without requiring excessive or unwieldy object detection. If a console object
is not detected, all logged messages will be stored internally until a logging
callback is added. If a console object is detected, but doesn't have any of
the `debug`, `info`, `warn`, and `error` logging methods, `log` will be used
in their place. For convenience, some of the less common console methods will
be passed through to the console object if they are detected, otherwise they
will simply fail gracefully.

### Targeted platforms ###

Debug is expected to work on any Javascript 1.2 compliant browser and
has been tested on the following platforms:

 * Chrome 6 and higher
 * Apple Safari 3 and higher
 * Mozilla Firefox 2 and higher
 * Microsoft Internet Explorer for Windows, version 6 and higher
 * Opera 10 and higher

Using Debug
---------------

To use Debug in your application, you may download the latest release
from our [Maven Repository](http://nexus.softec.lu:8081/service/local/repositories/opensource/content/lu/softec/js/debug/1.0/debug-0.4-compressed.jar)
and extract debug.js to a suitable location. Then include it
early in your HTML like so:

    <script type="text/javascript" src="/path/to/debug.js"></script>

You may also reference it directly in your maven build, when using
maven-javascript-plugin, using the following dependency:

    <dependency>
      <groupId>lu.softec.js</groupId>
      <artifactId>debug</artifactId>
      <version>0.4</version>
      <type>javascript</type>
      <scope>runtime</scope>
    </dependency>

### Building Debug from source ###

The build is based on Maven, using our modified maven-javascript-plugin.

Contributing to Debug
-------------------------

Fork our repository on GitHub and submit your pull request.

Documentation
-------------

The documentation has yet to be written

License
-------

Debug is a derivative work from

    JavaScript Debug - v0.4 - 6/22/2010
    http://benalman.com/projects/javascript-debug-console-log/
    Copyright (c) 2010 "Cowboy" Ben Alman

Debug is licenced under the MIT license.
