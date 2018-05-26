"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _connection = require("coco-lib/connection");

var _connection2 = _interopRequireDefault(_connection);

var _ws = require("ws");

var _nodeUuid = require("node-uuid");

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _storage = require("./components/storage");

var _storage2 = _interopRequireDefault(_storage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Server = function (_Connection) {
    _inherits(Server, _Connection);

    function Server(storage, server) {
        _classCallCheck(this, Server);

        var _this = _possibleConstructorReturn(this, (Server.__proto__ || Object.getPrototypeOf(Server)).call(this, storage));

        var self = _this;
        _this.clients = [];

        _storage2.default.User.prototype.sendMessage = function (type, packet) {
            var self = this;
            this.clients.forEach(function (client) {
                if (client.user === self) {
                    var message = self.sendPacket(type, packet, client);
                }
            });
        };

        _this.server = server;
        return _this;
    }

    _createClass(Server, [{
        key: "handleMessage",
        value: function handleMessage(type, data, client) {
            var user = null;

            switch (type) {
                case "DISCONNECT":
                    this.disconnect(client);
                    return true;
                case "REGISTER":
                    if (!data.username || !data.password) {
                        return false;
                    }

                    if (this.storage.users.findOneBy({ username: data.username }) !== null) {
                        return false;
                    }

                    user = new _storage2.default.User({
                        username: data.username,
                        password: data.password
                    });
                    user.save();

                    console.log("Registered");

                    console.log(this.storage.users.rows);
                    return true;
                case "LOGIN":
                    if (!data.username || !data.password) {
                        return false;
                    }

                    user = this.storage.users.findOneBy({ username: data.username });

                    if (user === null) {
                        return false;
                    }

                    if (user.password !== data.password) {
                        return false;
                    }

                    return this.connectUser(client, user);

            }
            return false;
        }
    }, {
        key: "storageTrigger",
        value: function storageTrigger(row, cmd) {
            var _this2 = this;

            console.log("Storage message: " + cmd);

            switch (row.table.name) {
                case "rooms":
                    this.clients.forEach(function (c) {

                        var data = {
                            table: row.table.name,
                            row: row.getData(),
                            command: cmd
                        };

                        _this2.sendPacket("storage", data, c.user);
                    });
                    break;
            }
        }
    }, {
        key: "init",
        value: function init() {
            var _this3 = this;

            for (var n in this.storage.tables) {
                if (n == "messages" || n == "users") {
                    continue;
                }
                var table = this.storage.tables[n];
                table.addTrigger(function (r, c) {
                    _this3.storageTrigger(r, c);
                });
            }

            var self = this;

            this.wss = new _ws.Server({ 'server': this.server });
            this.wss.on('connection', function (ws) {
                return self.connect(ws);
            });
        }
    }, {
        key: "connectUser",
        value: function connectUser(client, user) {
            var _this4 = this;

            if (client.user) {
                return false;
            }

            client.user = user;

            this.sendPacket('UPDATE_USER', { user: user.getData() }, client);
            console.log(user.rooms());
            user.rooms().forEach(function (room) {
                console.log(room);
                _this4.sendPacket("storage", {
                    command: "insert",
                    table: room.table.name,
                    row: room.getData()
                });

                room.userRows().forEach(function (r) {
                    _this4.sendPacket("storage", {
                        command: "insert",
                        table: r.table.name,
                        row: r.getData()
                    });
                });
            });

            return true;
        }
    }, {
        key: "disconnect",
        value: function disconnect(client) {
            if (this.clients.indexOf(client) > -1) {
                this.clients.splice(this.clients.indexOf(client, 1));
            }
        }
    }, {
        key: "connect",
        value: function connect(client) {
            var _this5 = this;

            client.on('message', function (m) {
                m = JSON.parse(m);
                _this5.onSocketData(m, client);
            });

            // user.save()
            //
            // // todo Rewrite this
            // this.sendPacket('UPDATE_USER', {user: user.getData()}, user)

            this.clients.push(client);
        }
    }, {
        key: "send",
        value: function send(data, client) {
            try {
                client.send(JSON.stringify(data));
            } catch (e) {
                console.log("Error sending: " + e);
            }
        }
    }]);

    return Server;
}(_connection2.default);

exports.default = Server;