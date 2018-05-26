"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _storage = require("coco-lib/storage");

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LocalStorage = function (_Storage$Storage) {
    _inherits(LocalStorage, _Storage$Storage);

    function LocalStorage(file) {
        _classCallCheck(this, LocalStorage);

        var _this = _possibleConstructorReturn(this, (LocalStorage.__proto__ || Object.getPrototypeOf(LocalStorage)).call(this));

        _this.file = file;

        _this.ignore = ['messages'];
        return _this;
    }

    _createClass(LocalStorage, [{
        key: "load",
        value: function load(callback) {
            var self = this;

            _fs2.default.readFile(this.file, 'utf8', function (err, data) {
                if (err) {
                    console.log("db file not exist");
                } else {
                    var json = JSON.parse(data);
                    for (var t in json) {
                        var _data = json[t];

                        for (var i in _data) {
                            var row = _data[i];
                            row = new _storage.Storage.DynamicClass(self[t].rowClass, row);
                            self[t].insert(row);
                        }
                    }

                    console.log("DB Loaded");
                }

                callback();
            });
        }
    }, {
        key: "saveTriggers",
        value: function saveTriggers() {
            var self = this;

            for (var t in this.tables) {
                if (this.ignore.indexOf(t) > -1) {
                    continue;
                }

                var table = this[t];

                table.addTrigger(function () {
                    self.save();
                });
            }
        }
    }, {
        key: "save",
        value: function save() {
            var data = {};
            for (var t in this.tables) {
                if (this.ignore.indexOf(t) > -1) {
                    continue;
                }

                var table = this[t];
                data[t] = [];

                for (var i in table.rows) {
                    var row = table.rows[i];
                    data[t].push(row.getData());
                }
            }

            var json = JSON.stringify(data);
            _fs2.default.writeFile(this.file, json, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("The DB was saved");
            });
        }
    }]);

    return LocalStorage;
}(_storage.Storage.Storage);

exports.default = LocalStorage;