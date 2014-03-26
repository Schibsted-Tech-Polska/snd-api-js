var fs = require('fs'),
    express = require('express'),
    path = require('path'),
    root = path.normalize("" + __dirname + "/.."),
    pub = "" + root + "/test/public",
    port = 8081,

    allowCORS = function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Accept, X-Snd-Apisignature");
        if (req.method === "OPTIONS") {
            res.send(200);
        } else {
            next();
        }
    };

app = express();
app.use(function(req, res, next) {
    //console.log(req.url);
    next();
});
app.use(app.router);
app.use(express["static"](pub));
app.use(express.bodyParser());
app.use(allowCORS);

app.get('/src/sndapi.js', function(req, res) {
    return res.sendfile(path.normalize("" + root + "/src/sndapi.js"));
});

app.get('/sts/signature', function(req, res) {
    return res.send({
        token: "0xbb49acbf8d574969a8ae0f379f4ef19fdaba09dd9fd851d8761160630ccee52c"
    });
});

function start() {
    app.listen(port);
}

function stop() {
    //app.close();
    app = null;
}


module.exports = {
    start: start,
    stop : stop
}