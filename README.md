sndapi.js
=========

`sndapi.js` is Schibsted Norge Digital API utility library to access the API from JavaScript. It manages the tokens thrown back and forth for authorization of the requests.


Usage
-----

	var api = new SNDAPI({
        key: "your123secret789key"
    });
    api.init();
	api.ajax({ url: "publication/common/sections/1/auto" })
	    .success(function(data) {
	        console.log(data);
	        ok(data, "data received");
	    })
	    .fail(function(error) {
	        console.error("request failed");
	        console.error(error);
	    });


Building
---------

`npm` and `gulp` are required to build this project. Then just run

	gulp

and the `build/sndapi.min.js` file should be updated (and the filesystem watched for changes).