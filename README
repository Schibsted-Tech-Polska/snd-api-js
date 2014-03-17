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
