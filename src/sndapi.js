/*global QUnit,ok,expect,start,test,asyncTest,ActiveXObject */
//noinspection ThisExpressionReferencesGlobalObjectJS
/*
 * Schibsted Norge Digital API helper.
 *
 * This file is library/framework independent, but runs unit tests if used within mno framework.

 * If JSON is defined, responses sent with mime type application/json will be parsed automatically.
 */

/**
 * The SND API connector.
 * @type {*}
 */
var SNDAPI = SNDAPI || function(options) {
    "use strict";

    var apiOptions = mergeOptions({
            refreshInterval    : 30 * /*minutes*/6e4,
            signatureServiceUrl: "http://apitestbeta3.medianorge.no/sts/signature",
            prefixUrl          : "http://api.snd.no/news/v2/",
            key                : null
        }, options),
        publicApi,

        state = {
            token     : null,
            tokenTimer: null
        },

    // replace these on production with empty implementations
        log = function(msg) {
            console.log(msg);
        },
        err = function(msg) {
            console.error(msg);
        };

    function init() {
        if (!apiOptions.key) {
            throw new Error("API key is required for SND API initalization");
        }
        refreshToken();
        if (state.tokenTimer) { clearInterval(state.tokenTimer); }
        state.tokenTimer = setInterval(refreshToken, apiOptions.refreshInterval);
    }

    function refreshToken() {
        ajax({
            sign: false,
            url: apiOptions.signatureServiceUrl + "?api-key=" + apiOptions.key
        })
            .success(function(response, statusDetails) {
                state.token = response.token;
                log("token: " + state.token);
                log(statusDetails);
            })
            .fail(function(error) {
                err(error);
            });
    }

    /**
     * Overwrite default options with given ones and return them in a new object (shallow copying here).
     * @param defaults {object} Your map of default values for options
     * @param given {object?} Options given in this particular method call, can be undefined
     * @returns {object} A new object with shallow copy of defaults overwritten with shallow copy of given options
     */
    function mergeOptions(defaults, given) {
        var key, result = {}, hop = Object.hasOwnProperty;
        for (key in defaults) {
            if (hop.call(defaults, key)) {
                //noinspection JSUnfilteredForInLoop
                result[key] = defaults[key];
            }
        }
        if (typeof given === "object") {
            for (key in given) {
                if (hop.call(given, key)) {
                    //noinspection JSUnfilteredForInLoop
                    result[key] = given[key];
                }
            }
        }
        return result;
    }

    function ajax(options) {
        var requestOtions = mergeOptions({
                // the defaults:
                url     : null,
                postData: null,
                sign: true
            }, options),
            req = createXMLHTTPObject(),
            method = (requestOtions.postData) ? "POST" : "GET",
            onSuccess = [],
            onError = [],
            status = null,
            statusDetails = {
                response: null
            },
            preferJSON = true,
            chainableResult = {};

        if (!/^http/.test(requestOtions.url)) {
            // prepend the standard prefix
            requestOtions.url = apiOptions.prefixUrl + requestOtions.url;
        }

        // public API

        /**
         * Add success callback to the AJAX call
         * @param callback
         * @returns {*}
         */
        chainableResult.success = function(callback) {
            onSuccess.push(callback);
            return resolveAndReturn();
        };


        /**
         * Add fail (error) callback to the AJAX call
         * @param callback
         * @returns {*}
         */
        chainableResult.fail = function(callback) {
            onError.push(callback);
            return resolveAndReturn();
        };


        function resolve() {
            var cb;
            if (status === "success") {
                while (!!(cb = onSuccess.pop())) { cb(statusDetails.response, statusDetails); }
            } else {
                while (!!(cb = onError.pop())) { cb(statusDetails); }
            }
        }

        function resolveAndReturn() {
            if (status) { resolve(); }
            return chainableResult;
        }


        if (!req) {
            status = "fail";
            return chainableResult;
        }
        chainableResult.req = req; // publish the object, why not
        req.open(method, requestOtions.url, true);

        // no idea why this was in stackOverflow code
        // req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');

        // adding signature
        if (state.token && requestOtions.sign) { req.setRequestHeader('x-snd-apisignature', state.token); }
        if (requestOtions.postData) { req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'); }
        if (preferJSON) { req.setRequestHeader('Accept', 'application/javascript, application/json'); }

        req.onreadystatechange = function() {
            if (req.readyState !== 4) { return; }
            if (req.status !== 200 && req.status !== 304) {
                status = "fail";
                statusDetails = {
                    statusCode: req.status,
                    statusText: req.statusText,
                    response  : req.responseText
                };
            } else {
                status = "success";
                statusDetails = {
                    statusCode: req.status,
                    statusText: req.statusText,
                    response  : req.responseText
                };
                if (req.getResponseHeader("Content-Type") === "application/json" && JSON) {
                    statusDetails.response = JSON.parse(statusDetails.response);
                }
            }
            resolve();
        };
        if (req.readyState === 4) {
            if (console) {console.warn("I did not expect to get here");}
            return;
        }
        req.send(requestOtions.postData);

        return chainableResult;
    }

    var XMLHttpFactories = [
        function() {return new XMLHttpRequest();},
        function() {return new ActiveXObject("Msxml2.XMLHTTP");},
        function() {return new ActiveXObject("Msxml3.XMLHTTP");},
        function() {return new ActiveXObject("Microsoft.XMLHTTP");}
    ];

    function createXMLHTTPObject() {
        var xmlhttp = false;
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
            }
            catch (e) {
                continue;
            }
            break;
        }
        return xmlhttp;
    }

    function selftest() {
        mno.test.schedule('SNDAPI.js', {
            getToken: function() { return state.token; },
            getTokenTimer: function() { return state.tokenTimer; }
        });
    }

    publicApi = {
        init: init,
        ajax: ajax
    };
    if (mno && mno.test && mno.test.now) {
        publicApi.test = selftest;
    }

    return publicApi;
};

/*global mno, console*/
if (mno && mno.test && mno.test.now) {
    (function() {
        "use strict";
        mno.test.register({
            id   : "SNDAPI.js",
            suite: function(state) {
                test("refresh token initializes", function(assert) {
                    assert.ok(!!(state.getTokenTimer()), "token timer is set");
                });
                asyncTest("we get a token", function(assert) {
                    expect(1);
                    function check() {
                        if (state.getToken()) {
                            assert.ok(true, "token set");
                            start();
                            return;
                        }
                        setTimeout(check, 100);
                    }

                    check();
                });
                asyncTest("we can make a request with this token", function() {
                    expect(1);
                    api.ajax({ url: "publication/common/sections/1/auto" })
                        .success(function(data) {
                            console.log(data);
                            ok(data, "data received");
                        })
                        .fail(function(error) {
                            console.error("request failed");
                            console.error(error);
                        });
                });
            }
        });

        var key = "afLKmZNSMrZybha2zsp9YNhB",
            api = new SNDAPI({
                key: key
            });
        api.init();
        api.test();
    })();
}



