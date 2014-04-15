snd-api-js 
==========

`sndapi.js` is Schibsted Norge Digital news API utility library to access the API from JavaScript. It manages the tokens thrown back and forth for authorization of the requests.

It is lightweight (only 3.4 KiB when minified, 1.8 KiB to download!) and very simple to use (construct, init, ajax!). It has no external dependencies and requires CORS-aware browser — consult http://caniuse.com/cors if in doubt.


Installation
------------

You can either:
* include the JavaScript file before you use it with a `script` tag or
* (SOON, not yet in the registry) install it as a [bower](http://bower.io/) package

### bower
If you use `bower`, you can install this package providing the git repository URL:

    git@bitbucket.org:schibstednorge/snd-api-js.git

It should include the minified output file and some documentation in your `bower_components` directory:

```bash
    ➜  your_project $  tree bower_components -L 2
    bower_components
    `-- snd-api-js
        |-- README.md
        |-- bower.json
        |-- docs
        `-- sndapi.min.js
```

Usage
-----

Then, in your code, you create an instance of SNDAPI object (providing at least your API client id key, for more options refer to the JSDoc in `docs` directory), initialize it and there make AJAX calls in a familiar way:

```js
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
```

More documentation
------------------

JSDoc is generated with `gulp-jsdoc` and can be viewed in the `docs/SNDAPI.html`. Because of most git repo viewers'
security limitations, it's best viewed offline, from your hard disk.


Contributing and building
-------------------------

`npm` and `gulp` are required to build this project. Then just run

	gulp

and the `build/sndapi.min.js` file should be updated (and the tests run, and the filesystem watched for changes).
If you don't want waching for changes and want to build+test only once, use `gulp once`.


We use semantic versioning which is made easy with the following commands:

    gulp patch # after you patched a bug in a backwards-compatible manner
    gulp feature # after you added a new feature that doesn't break backward-compatibility, bumps minor version
    gulp release # after you created a new backwards-incompatible release, bumps major version number

These will bump the version both in `package.json` and `bower.json`, tag the repository and push the tags.
The commands are more documented in the gulpfile.



Testing
-------

That's under development. You can simply run `gulp test` or `npm test` now, but it doesn't finish the process automatically yet. Tests are written for QUnit and placed in `sndapi-test.js` file.

Unfortunately right now the `gulp-qunit` plugin didn't seem to accept a HTTP protocol URL as the argument, only a local file, and when it uses a local file, its PhantomJS doesn't resolve other local files referenced by just `src="qunit.js"` and such  (though might be fixed by [gulp-qunit pull request #8](https://github.com/jonkemp/gulp-qunit/pull/8)). Therefore we start an Express server that hosts the test files and provides simple mock responses that the real API server should return. The tests will be changed to use this server instead of the real one (that does not work, he he).

To serve everything that's required and run the tests, run:

		gulp test

It will use port 8081 for serving content to PhantomJS with QUnit.

