/*global QUnit,console,SNDAPI,test,module,asyncTest,start,expect,equal,ok*/
(function() {
    "use strict";

    var key = "afLKmZNSMrZybha2zsp9YNhB",
        mode = "local",
        options = {},
        apiFactory = function(mode) {
            switch (mode) {
                case "local":
                    options = {
                        key                : key,
                        signatureServiceUrl: "http://localhost:8081/sts/signature",
                        prefixUrl          : "http://127.0.0.1:8081/news/v2/"
                    };
                    return new SNDAPI(options);
                case "beta":
                    options = {
                        key                : key,
                        signatureServiceUrl: "http://apitestbeta3.medianorge.no/sts/signature",
                        prefixUrl          : "http://apitestbeta3.medianorge.no/news/v2/"
                    };
                    return  new SNDAPI(options);
                case "production":
                    options = {
                        key                : key,
                        signatureServiceUrl: "//api.snd.no/sts/signature",
                        prefixUrl          : "//api.snd.no/news/v2/"
                    };
                    return new SNDAPI(options);
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
        expect(1);
        var api = apiFactory(mode);

        api.ajax({ url: "publication/common/sections/1/auto" })
            .success(function() {
                assert.ok(true, "it succeeded");
                start();
            })
            .fail(function(error) {
                console.error("request failed");
                console.error(error);
            });
        api.init();
    });

    asyncTest("requests correctly assume protocol", function() {
        var xhr = this.sandbox.useFakeXMLHttpRequest();
        var req;
        this.clock.restore();

        function getLastRequest() {
            return xhr.requests.pop();
        }

        api.ajax({ url: "a/b/c" });
        req = getLastRequest();
        ok(req.url.indexOf(options.prefixUrl) === 0, 'it prepends prefixUrl (url starts with a letter)');

        api.ajax({ url: "/a/b/c" });
        req = getLastRequest();
        ok(req.url.indexOf(options.prefixUrl) === 0, 'it prepends prefixUrl (url starts with /)');

        api.ajax({ url: "//a/b/c" });
        req = getLastRequest();
        ok(req.url.indexOf('//') === 0, 'it leaves //a/b/c alone');

        api.ajax({ url: "http://a/b/c" });
        req = getLastRequest();
        ok(req.url.indexOf('http://') === 0, 'it leaves http://a/b/c alone');

        api.ajax({ url: "https://a/b/c" });
        req = getLastRequest();
        ok(req.url.indexOf('https://') === 0, 'it leaves http://a/b/c alone');

        api.ajax({ url: "myinvention://a/b/c" });
        req = getLastRequest();
        ok(req.url.indexOf('myinvention://') === 0, 'it leaves myinvention://a/b/c alone');

        xhr.restore();
        start();
    });
})();