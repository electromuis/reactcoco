"use strict";

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _server = require("./server");

var _server2 = _interopRequireDefault(_server);

var _localStorage = require("./localStorage");

var _localStorage2 = _interopRequireDefault(_localStorage);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = _http2.default.createServer();
var app = new _express2.default({ server: server });

var storage = new _localStorage2.default("db.json");

var socketServer = new _server2.default(storage, server);

storage.load(function () {

    storage.saveTriggers();
    socketServer.init();
});

server.on('request', app);
server.listen(8080, function () {
    return console.log('Listening on port 8080.');
});