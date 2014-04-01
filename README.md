sndapi.js
=========

`sndapi.js` is Schibsted Norge Digital API utility library to access the API from JavaScript. It manages the tokens thrown back and forth for authorization of the requests.


Usage
-----

If you use `bower`, you can install this package providing the git repository URL:

    git@git.ikari.pl:schibsted/snd-api-js.git

It should include the minified output file and some documentation in your `bower_components` directory:

    ➜  your_project $  tree bower_components -L 2
    bower_components
    `-- snd-api-js
        |-- README.md
        |-- bower.json
        |-- docs
        `-- sndapi.min.js

Then, in your code, you create an instance of SNDAPI object (providing at least your API client id key, for more options refer to the JSDoc in `docs` directory), initialize it and there make AJAX calls in a familiar way:

	var api = new SNDAPI({
        key: "your123secret789key" // also known as client ID in some docs.
    });
    api.init(); // you can also attach .success and .fail here
	api.ajax({ url: "publication/common/sections/1/auto" })
	    .success(function(data, statusDetails) {
	        console.log("HTTP response code: " + statusDetails.statusCode);
	        console.log("HTTP status text:   " + statusDetails.statusText);
	        ok(data === statusDetails.response);
	        ok(data, "data received");
	    })
	    .fail(function(statusDetails) {
	        console.error("request failed");
	        console.error("Response code: " + statusDetails.statusCode);
	    });

More documentation
------------------

JSDoc is generated with `gulp-jsdoc` and can be viewed in the `docs/SNDAPI.html`. Because of most git repo viewers'
security limitations, it's best viewed offline, from your hard disk.


Building
---------

`npm` and `gulp` are required to build this project. Then just run

	gulp

and the `build/sndapi.min.js` file should be updated (and the tests run, and the filesystem watched for changes).


Testing
-------

That's under development. You can simply run `gulp test` or `npm test` now, but it doesn't finish the process automatically yet. Tests are written for QUnit and placed in `sndapi-test.js` file.

Unfortunately right now the `gulp-qunit` plugin didn't seem to accept a HTTP protocol URL as the argument, only a local file, and when it uses a local file, its PhantomJS doesn't resolve other local files referenced by just `src="qunit.js"` and such  (though might be fixed by [gulp-qunit pull request #8](https://github.com/jonkemp/gulp-qunit/pull/8)). Therefore we start an Express server that hosts the test files and provides simple mock responses that the real API server should return. The tests will be changed to use this server instead of the real one (that does not work, he he).

To serve everything that's required and run the tests, run:

		gulp test

It will use port 8081 for serving content to PhantomJS with QUnit.

