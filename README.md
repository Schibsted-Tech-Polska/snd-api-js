sndapi.js
=========

`sndapi.js` is Schibsted Norge Digital API utility library to access the API from JavaScript. It manages the tokens thrown back and forth for authorization of the requests.


Usage
-----

	var api = new SNDAPI({
        key: "your123secret789key" // also known as client ID in some docs.
    });
    api.init(); // you can also attach .success and .fail here
	api.ajax({ url: "publication/common/sections/1/auto" })
	    .success(function(data, statusDetails) {
	    	var println = (console && console.log) ? console.log : function(){};
	        println("HTTP response code: " + statusDetails.statusCode);
	        println("HTTP status text:   " + statusDetails.statusText);
	        ok(data === statusDetails.response);
	        ok(data, "data received");
	    })
	    .fail(function(statusDetails) {
	        console.error("request failed");
	        console.error("Response code: " + statusDetails.statusCode);
	    });

More documentation
------------------

We are looking into including `gulp-jsdoc` into the build process so that you would get a more detailed documentation of the available API and its options.


Building
---------

`npm` and `gulp` are required to build this project. Then just run

	gulp

and the `build/sndapi.min.js` file should be updated (and the filesystem watched for changes).


Testing
-------

That's under development. The goal is that when you run `gulp test` or `npm test`, it should just do the unit tests (currently written for QUnit and placed in `sndapi-test.js` file). 

Unfortunately right now the `gulp-qunit` plugin doesn't seem to accept a HTTP protocol URL as the argument, only a local file, and when it uses a local file, its PhantomJS doesn't resolve other local files referenced by just `src="qunit.js"` and such. 

Right now you have to run the server in one session, with 

		coffee test/server.coffee

and it will server the static files + respond with mock API responses for future testing (tests should not depend on a working API server somewhere on the Internet), and in the second window you can:

		gulp test

It will load the file that would fetch the other files form localhost via HTTP.

