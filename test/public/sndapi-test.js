/*global QUnit,console,SNDAPI,test,module,asyncTest,expect*/
(function() {
    "use strict";

    var key = "afLKmZNSMrZybha2zsp9YNhB",
        mode = "local",
        apiFactory = function(mode) {
            switch (mode) {
                case "local":
                    return new SNDAPI({
                        key                : key,
                        signatureServiceUrl: "http://localhost:8081/sts/signature",
                        prefixUrl          : "http://127.0.0.1:8081/news/v2/"
                    });
                case "beta":
                    return  new SNDAPI({
                        key                : key,
                        signatureServiceUrl: "http://apitestbeta3.medianorge.no/sts/signature",
                        prefixUrl          : "http://apitestbeta3.medianorge.no/news/v2/"
                    });
                case "production":
                    return new SNDAPI({
                        key: key
                    });
            }
            throw new Error("unknown mode, use 'local', 'beta' or 'production', ok?");
        },
        api = apiFactory(mode);

    api.init()
        .fail(function() {
            console.log("You have not started the local server (for example with `gulp serve`), testing with beta API");
            api = apiFactory("beta");
            api.init();
        });
    QUnit.module("sndapi.js");
    QUnit.config.testTimeout = 20000;

    test("refresh timer initializes", function(assert) {
        assert.ok(api.getState().tokenTimerIsSet, "token timer is set");
    });

    asyncTest("we get a token", function(assert) {
        expect(1);
        function check() {
            if (api.getState().tokenIsSet) {
                assert.ok(true, "token set");
                start();
                return;
            }
            setTimeout(check, 100);
        }

        check();
    });
    asyncTest("we can make a request with this token", function(assert) {
        expect(1);
        function retry() {
            if (api.getState().tokenIsSet) {
                api.ajax({ url: "publication/common/sections/1/auto" })
                    .success(function(data) {
                        console.log("response received" + (data.length ? ": " + data.length + " bytes" : ""));
                        assert.ok(typeof data !== "undefined", "data received");
                        start();
                    })
                    .fail(function(error) {
                        console.error("request failed");
                        console.error(error);
                    });
            }
            else {
                setTimeout(retry, 100);
            }
        }

        retry();
    });
    asyncTest("requests started before grabbing a token are queued", function(assert) {
        var api = apiFactory(mode),
            requestMade = false,
            responseRcvd = false;

        api.ajax({ url: "publication/common/sections/1/auto" })
            .success(function() {
                responseRcvd = true;
            })
            .fail(function(error) {
                console.error("request failed");
                console.error(error);
            });

        requestMade = true;
        api.init();


        function retry() {
            if (requestMade && responseRcvd) {
                assert.ok(true, "it succeeded");
                start();
            }
            else {
                setTimeout(retry, 100);
            }
        }

        retry();
    });
})();