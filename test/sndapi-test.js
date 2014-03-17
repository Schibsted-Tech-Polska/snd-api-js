try {
var sinon = require("sinon");

console.error(Object.keys(sinon));
global.XMLHttpRequest = function() { return { withCredentials: true }; };


var
    sinon_event = require("sinon/lib/sinon/util/event"),
    fake_xhr = require("sinon/lib/sinon/util/fake_xml_http_request.js"),

    key = "afLKmZNSMrZybha2zsp9YNhB",
    api = new SNDAPI({
            key: key
    }), 
    privates = api.touch_private_parts();

//sinon.useFakeXMLHttpRequest();
} catch (e) {
    console.error(e.stack);
}
QUnit.module("sndapi.js", {
     setup: function () {
        this.xhr = fake_xhr;
        var requests = this.requests = [];

        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };
    },

    teardown: function () {
        this.xhr.restore();
    },
});
QUnit.config.testTimeout = 20000;

test("refresh token initializes", function(assert) {
    console.error(privates.getTokenTimer());
    console.error(requests);
    assert.ok(!!(privates.getTokenTimer()), "token timer is set");
});
asyncTest("we get a token", function(assert) {
    expect(1);
    function check() {
        if (privates.getToken()) {
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
