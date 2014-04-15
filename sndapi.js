/**
 * sndapi-js - SND  news API client library to access the API from JavaScript
 * @version v0.3.6
 * @link https://bitbucket.org/schibstednorge/snd-api-js
 * @license BSD-2-Clause
 */
/*
 * This file is library/framework independent. No runtime dependencies.
 * If JSON is defined, responses sent with mime type application/json will be parsed automatically.
 */

/*global global,ActiveXObject */
//noinspection ThisExpressionReferencesGlobalObjectJS

(function(global) {
    "use strict";

    /**
     * Creates a new SchoenfinkelizedResult object with empty callback lists and unresolved state.
     * @constructor
     * @alias SchoenfinkelizedResult
     * @classdesc This represents a result in form of a promise, that you can _curry_
     * (or _schönfinkelize_, hence the name) to attach as many handlers as you need and when you need them.
     * @returns {SchoenfinkelizedResult}
     */
    function SchoenfinkelizedResult() {
        if (!(this instanceof  SchoenfinkelizedResult)) {
            return new SchoenfinkelizedResult();
        }

        // instance properties
        this._onSuccess = [];
        this._onError = [];
        // enabling firing callback after promise resolution
        this._state = 0; // 1 - cool, 2 - not cool
        this._resolution = null;
    }

    /**
     * Add success callback to the AJAX call.

     * @param callback {function} This will be called if the request completes successfully
     * @memberOf SchoenfinkelizedResult
     * @returns {SchoenfinkelizedResult} self.
     * @public
     */
    SchoenfinkelizedResult.prototype.success = function(callback) {
        this._onSuccess.push(callback);
        this._refire();
        return this;
    };

    /**
     * Add fail (error/timeout) callback to the AJAX call
     *
     * @param callback {function} This will be called if the request fails
     * @returns {SchoenfinkelizedResult} self.
     */
    SchoenfinkelizedResult.prototype.fail = function(callback) {
        this._onError.push(callback);
        this._refire();
        return this;
    };

    /**
     * Used by the library to resolve the promise with a successful result
     * @param {...object} all parameters will be passed to success listeners
     * @returns {SchoenfinkelizedResult} self.
     */
    SchoenfinkelizedResult.prototype.resolve = function() {
        var cb, args = this._resolution || arguments;
        this._state = 1;
        this._resolution = args;
        while (!!(cb = this._onSuccess.shift())) {
            cb.apply(this, args);
        }
        return this;
    };

    /**
     * Used by the library to resolve the promise with an unsuccessful result
     * @param {...object} all parameters will be passed to fail listeners
     * @returns {SchoenfinkelizedResult} self.
     */
    SchoenfinkelizedResult.prototype.reject = function() {
        var cb, args = this._resolution || arguments;
        this._state = 2;
        this._resolution = args;
        while (!!(cb = this._onError.shift())) {
            cb.apply(this, args);
        }
        return this;
    };

    /**
     * Used internally. Delegates the responsibilities to another SchoenfinkelizedResult.
     *
     * We are using this when the operation is not done immediately, but instead
     * queued for later (when we have a valid token). We must reuse the handlers
     * that are *and will be (in the future)* attached to the original result to
     * fire them, when the new, internally called with .ajax again, operation ends.
     *
     * What it actually does is take the other listener array *references*
     * and plug them in here, concatenating all listeners.
     *
     * @param otherResult
     * @internal
     * @returns {SchoenfinkelizedResult} self.
     */
    SchoenfinkelizedResult.prototype.handleWith = function(otherResult) {
        this._onSuccess.forEach(function(item) { otherResult._onSuccess.push(item); });
        this._onError.forEach(function(item) { otherResult._onError.push(item); });
        this._onSuccess = otherResult._onSuccess; // use the reference
        this._onError = otherResult._onError; // use the reference
        this._refire();
        return this;
    };

    /**
     * If the promise was resolved before (either good or bad way, whatever),
     * fire the appropriate, late-defined callbacks!
     *
     * @private
     */
    SchoenfinkelizedResult.prototype._refire = function() {
        if (this._state > 0) {
            // we know the outcome
            if (this._state === 1) {
                // if it's good, fire good stuff callbacks.
                this.resolve();
            } else {
                // if it's bad, fire the one responsible.
                this.reject();
            }
        }
    };


    /**
     * Public API of the SND news API client. Registers as global SNDAPI constructor.
     * @global
     * @constructor
     * @alias SNDAPI
     * @param options {object} Options object
     * @param options.refreshInterval {number?} Interval of signature refresh, defaults to 30 minutes
     * @param options.signatureServiceUrl {string?} URL for the signature service
     * @param options.prefixUrl {string?} Common prefix for all URLs called later by the API (you can use partial URLs later)
     * @param options.key {string} API key of your client
     */
    global.SNDAPI = global.SNDAPI || function(options) {
        var apiOptions = mergeOptions({
                refreshInterval    : 30 * /*minutes*/6e4,
                signatureServiceUrl: "//api.snd.no/sts/signature",
                prefixUrl          : "//api.snd.no/news/v2/",
                key                : null
            }, options),
            publicApi,

            state = {
                token     : null,
                tokenTimer: null
            },
            queue = [];

        /**
         * Fetches an object representing the current state of the library.
         * @memberOf SNDAPI
         * @public
         * @instance
         * @returns {{tokenIsSet: boolean, tokenTimerIsSet: boolean}}
         */
        function getState() {
            return {
                /**
                 * is the token/signature set (received correctly from the server?)
                 */
                tokenIsSet     : !!(state.token),
                /**
                 * tells if the timer to refresh token automatically is set correctly (for debug)
                 */
                tokenTimerIsSet: !!(state.tokenTimer)
            };
        }

        /**
         * initializes the SND API and fetches a new token from the server
         * @memberOf SNDAPI
         * @instance
         */
        function init() {
            if (!apiOptions.key) {
                throw new Error("API key is required for SND API initalization");
            }
            if (state.tokenTimer) { clearInterval(state.tokenTimer); }
            state.tokenTimer = setInterval(refreshToken, apiOptions.refreshInterval);
            return refreshToken();
        }

        /**
         * refreshes the token/signature contacting the signature service
         * @returns {*}
         */
        function refreshToken() {
            return ajax({
                sign: false,
                url : apiOptions.signatureServiceUrl + "?api-key=" + apiOptions.key
            })
                .success(function(response, statusDetails) {
                    var request;
                    state.token = response.token;

                    if (queue.length) {
                        while ((request = queue.shift())) {
                            ajax(request.options).handleWith(request.result);
                        }
                    }
                })
                .fail(function(error) {
                    // TODO handle it? or leave it to the user?
                });
        }

        /**
         * Overwrite default options with given ones and return them in a new object (shallow copying here).
         * @param defaults {object} Your map of default values for options
         * @param given {object?} Options given in this particular method call, can be undefined
         * @returns {object} A new object with shallow copy of defaults overwritten with shallow copy of given options
         * @private
         * @instance
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

        /**
         * Make an AJAX call for any data
         * @param options {object} request parameters
         * @param options.url {object} request URL, will be prefixed with prefixUrl passed to constructor if relative
         * @param options.postData {object?} data that will be sent as POST body
         * @param [options.preferJSON=true] (boolean) do we want to add header asking politely for JSON content-type?
         * @param [options.sign=true] {boolean} sign this request with the x-snd-apisignature header
         * @memberOf SNDAPI
         * @instance
         * @returns {SchoenfinkelizedResult} a promise
         */
        function ajax(options) {
            var requestOptions = mergeOptions({
                    // the defaults:
                    url       : null,
                    postData  : null,
                    preferJSON: true,
                    sign      : true
                }, options),
                req = createXMLHTTPObject(),
                method = (requestOptions.postData) ? "POST" : "GET",

                status = null,
                statusDetails = {
                    response: null
                },
                result = new SchoenfinkelizedResult();


            if (!/^([a-z]+:)?\/\//.test(requestOptions.url)) {
                // prepend the standard prefix
                requestOptions.url = apiOptions.prefixUrl + requestOptions.url;
            }


            function resolve() {
                if (status === "success") {
                    return result.resolve(statusDetails.response, statusDetails);
                } else {
                    return result.reject(statusDetails);
                }
            }


            if (!req) {
                status = "fail";
                return result;
            }
            result.req = req; // publish the object, why not


            // queue if we are not ready
            if (!state.token && requestOptions.sign) {
                queue.push({
                    options: requestOptions,
                    result : result
                });
                return result;
            }


            // otherwise make the request
            req.open(method, requestOptions.url, true);

            // no idea why this was in stackOverflow code
            // req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');

            // adding signature
            if (state.token && requestOptions.sign) { req.setRequestHeader('X-Snd-Apisignature', state.token); }
            if (requestOptions.postData) { req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'); }
            if (requestOptions.preferJSON) {
                req.setRequestHeader('Accept', 'application/json');
            }

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
                    if (req.getResponseHeader("Content-Type").match(/^application\/json/) && JSON) {
                        try {
                            statusDetails.response = JSON.parse(statusDetails.response);
                        } catch (e) {
                            // do not parse :D
                        }
                    }
                }
                resolve();
            };
            if (req.readyState === 4) {
                if (global.console) {global.console.warn("I did not expect to get here");}
                return null;
            }
            req.send(requestOptions.postData);

            return result;
        }

        var XMLHttpFactories = [
            function() {return new XMLHttpRequest();},
            function() {return new ActiveXObject("Msxml2.XMLHTTP");},
            function() {return new ActiveXObject("Msxml3.XMLHTTP");},
            function() {return new ActiveXObject("Microsoft.XMLHTTP");}
        ];

        function createXMLHTTPObject() {
            var XmlHttp = false;
            for (var i = 0; i < XMLHttpFactories.length; i++) {
                try { XmlHttp = XMLHttpFactories[i](); }
                catch (e) { continue; }
                break;
            }
            return XmlHttp;
        }

        publicApi = {
            init    : init,
            getState: getState,
            ajax    : ajax
        };

        return publicApi;
    };

})(typeof global === "object" ? global : this);

/*global module,SNDAPI */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SNDAPI;
}