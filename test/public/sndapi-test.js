var key = "afLKmZNSMrZybha2zsp9YNhB",
    api = new SNDAPI({
            key: key
    });
api.init();

QUnit.module("sndapi.js", {
     setup: function () {
        // this.xhr = fake_xhr;
        // var requests = this.requests = [];

        // this.xhr.onCreate = function (xhr) {
        //     requests.push(xhr);
        // };
    },

    teardown: function () {
        //this.xhr.restore();
    }
});
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
    api.ajax({ url: "publication/common/sections/1/auto" })
    .success(function(data) {
        console.log("response received" + (data.length ? ": " + data.length + " bytes" : ""));
        assert.ok(typeof data !== "undefined" , "data received");
        start();
    })
    .fail(function(error) {
        console.error("request failed");
        console.error(error);
    });
});
