"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ORMConfig = exports.ORMConfig = function () {
  function ORMConfig() {
    _classCallCheck(this, ORMConfig);

    this._database = null;
    this._debug = false;
  }

  _createClass(ORMConfig, [{
    key: "database",
    get: function get() {
      return this._database;
    },
    set: function set(database) {
      this._database = database;
    }
  }, {
    key: "debug",
    get: function get() {
      return this._debug;
    },
    set: function set(debug) {
      this._debug = debug;
    }
  }]);

  return ORMConfig;
}();

exports.default = ORMConfig;