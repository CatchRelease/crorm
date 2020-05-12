"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.ORMConfig = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ORMConfig = /*#__PURE__*/function () {
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

exports.ORMConfig = ORMConfig;
var _default = ORMConfig;
exports["default"] = _default;