/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, node:true */
"use strict";

var fs = require('fs'),
    express = require('express'),
    path = require('path'),
    root = path.normalize("" + __dirname + "/.."),
    pub = "" + root + "/test/public",
    port = 8081,
    app,
    server = null,

    allowCORS = function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type,Accept,accept,x-snd-apisignature");
        if (req.method === "OPTIONS") {
            res.send(200);
        } else {
            next();
        }
    };

app = express();
app.use(allowCORS);
app.use(app.router);
app.use(express["static"](pub));
app.use(express.bodyParser());

app.get('/src/sndapi.js', function(req, res) {
    return res.sendfile(path.normalize("" + root + "/src/sndapi.js"));
});

app.get('/sts/signature', function(req, res) {
    return res.send({
        token: "0xbb49acbf8d574969a8ae0f379f4ef19fdaba09dd9fd851d8761160630ccee52c"
    });
});

app.get('/news/v2/:publication/:something/:somethingelse/:someId/:somethingEvenMoreElse', function(req, res) {
    var signature = req.header("X-Snd-Apisignature");
    if (typeof signature !== "string" && signature.length < 1) {
        console.error("Request was unsigned!");
        return res.send(403);
    }
    console.log("Request was signed with signature: " + signature);
    return res.send(

        {
            "version"   : "1.0.4",
            "id"        : "http://api.snd.no/news/v2/publication/common/sections/1/auto",
            "title"     : "Publication: common - Section: 1",
            "links"     : [
                {
                    "self": "http://api.snd.no/news/v2/publication/common/sections/1/auto",
                    "type": "application/json",
                    "rel" : "self"
                },
                {
                    "self": "http://api.snd.no/news/v2/publication/common/sections/1/auto&offset=100",
                    "type": "application/json",
                    "rel" : "next"
                }
            ],
            "entries"   : [
                {
                    "id"        : "http://api.snd.no/news/v2/publication/common/searchContents/instance?contentId=428410&contentType=article",
                    "type"      : "application/json",
                    "title"     : "F\u00f8rste Juventus-tap siden oktober",
                    "published" : "2014-03-30T21:29:48.000Z",
                    "updated"   : "2014-03-30T21:29:48.000Z",
                    "content"   : {
                        "model"                   : "http://verticalweb.snd.no:8080/webservice/content-descriptions/news",
                        "frontpagetitle"          : "F\u00f8rste Juventus-tap siden oktober",
                        "frontpageleadtext"       : "Juventus gikk p\u00e5 sitt andre nederlag i ligaen for sesongen.",
                        "videoplaybuttonwatermark": "false"
                    },
                    "links"     : [
                        {
                            "self"      : "http://vertical.snd.no/incoming/article428411.ece/{snd:mode}/{snd:cropversion}/afp000694113.jpg",
                            "type"      : "image/jpeg",
                            "rel"       : "TEASERREL",
                            "attributes": {
                            }
                        }
                    ],
                    "extensions": [
                        {
                            "name"      : "snd:origUrl",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : ["http://vertical.snd.no/100Sport/fotball/italia/article428410.ece"
                            ]
                        },
                        {
                            "name"      : "snd:hidden",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : [""
                            ]
                        },
                        {
                            "name"      : "snd:id",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : ["428410"
                            ]
                        },
                        {
                            "name"      : "snd:paywallState",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : ["open"
                            ]
                        },
                        {
                            "name"      : "snd:hiddenArticle",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : ["false"
                            ]
                        },
                        {
                            "name"      : "snd:section",
                            "attributes": {
                                "xmlns:snd" : "http://xmlns.snd.no/api",
                                "id"        : "71",
                                "uniqueName": "fotball_italia",
                                "name"      : "Italia",
                                "path"      : "100Sport/fotball/italia/"
                            },
                            "children"  : [
                            ]
                        }
                    ]
                },
                {
                    "id"        : "http://api.snd.no/news/v2/publication/common/searchContents/instance?contentId=428408&contentType=article",
                    "type"      : "application/json",
                    "title"     : "Se Branns mareritt\u00e5pning p\u00e5 seks minutter",
                    "published" : "2014-03-30T21:18:14.000Z",
                    "updated"   : "2014-03-31T07:18:38.000Z",
                    "content"   : {
                        "model"                   : "http://verticalweb.snd.no:8080/webservice/content-descriptions/news",
                        "frontpagetitle"          : "Se Branns mareritt\u00e5pning p\u00e5 seks minutter",
                        "frontpageleadtext"       : "Sammendrag av det viktigste i kampen ser du her.",
                        "videoplaybuttonwatermark": "true"
                    },
                    "links"     : [
                        {
                            "self"      : "http://vertical.snd.no/incoming/article428407.ece/{snd:mode}/{snd:cropversion}/tap%204.jpg",
                            "type"      : "image/jpeg",
                            "rel"       : "TEASERREL",
                            "attributes": {
                            }
                        }
                    ],
                    "extensions": [
                        {
                            "name"      : "snd:origUrl",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : ["http://vertical.snd.no/100Sport/fotball/eliteserien/article428408.ece"
                            ]
                        },
                        {
                            "name"      : "snd:hidden",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : [""
                            ]
                        },
                        {
                            "name"      : "snd:id",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : ["428408"
                            ]
                        },
                        {
                            "name"      : "snd:paywallState",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : ["open"
                            ]
                        },
                        {
                            "name"      : "snd:hiddenArticle",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : ["false"
                            ]
                        },
                        {
                            "name"      : "snd:section",
                            "attributes": {
                                "xmlns:snd" : "http://xmlns.snd.no/api",
                                "id"        : "60",
                                "uniqueName": "fotball_eliteserien",
                                "name"      : "Eliteserien",
                                "path"      : "100Sport/fotball/eliteserien/"
                            },
                            "children"  : [
                            ]
                        }
                    ]
                },
                {
                    "id"        : "http://api.snd.no/news/v2/publication/common/searchContents/instance?contentId=428403&contentType=article",
                    "type"      : "application/json",
                    "title"     : "Se Stab\u00e6ks m\u00e5lfest",
                    "published" : "2014-03-30T20:52:56.000Z",
                    "updated"   : "2014-03-31T08:20:40.000Z",
                    "content"   : {
                        "model"                   : "http://verticalweb.snd.no:8080/webservice/content-descriptions/news",
                        "frontpagetitle"          : "Se Stab\u00e6ks m\u00e5lfest",
                        "frontpageleadtext"       : "H\u00f8ydepunkter fra 3-0-seieren over Sogndal.",
                        "videoplaybuttonwatermark": "true"
                    },
                    "links"     : [
                        {
                            "self"      : "http://vertical.snd.no/incoming/article428402.ece/{snd:mode}/{snd:cropversion}/Stab%C3%A6k.jpg",
                            "type"      : "image/jpeg",
                            "rel"       : "TEASERREL",
                            "attributes": {
                            }
                        }
                    ],
                    "extensions": [
                        {
                            "name"      : "snd:origUrl",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : ["http://vertical.snd.no/100Sport/fotball/eliteserien/article428403.ece"
                            ]
                        },
                        {
                            "name"      : "snd:hidden",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : [""
                            ]
                        },
                        {
                            "name"      : "snd:id",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : ["428403"
                            ]
                        },
                        {
                            "name"      : "snd:paywallState",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : ["open"
                            ]
                        },
                        {
                            "name"      : "snd:hiddenArticle",
                            "attributes": {
                                "xmlns:snd": "http://xmlns.snd.no/api"
                            },
                            "children"  : ["false"
                            ]
                        },
                        {
                            "name"      : "snd:section",
                            "attributes": {
                                "xmlns:snd" : "http://xmlns.snd.no/api",
                                "id"        : "60",
                                "uniqueName": "fotball_eliteserien",
                                "name"      : "Eliteserien",
                                "path"      : "100Sport/fotball/eliteserien/"
                            },
                            "children"  : [
                            ]
                        }
                    ]
                }
            ],
            "extensions": [
                {
                    "name"      : "snd:totalArticles",
                    "attributes": {
                        "xmlns:snd": "http://xmlns.snd.no/api"
                    },
                    "children"  : ["188813.0"
                    ]
                }
            ]
        }
    );
});

function start() {
    server = app.listen(port);
}

function stop() {
    //app.close();
    server.close();
}


module.exports = {
    start: start,
    stop : stop
};