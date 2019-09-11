"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ormBase = _interopRequireDefault(require("./orm/ormBase"));

var _ormConfig = _interopRequireDefault(require("./orm/ormConfig"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var config = new _ormConfig["default"]();
var ORM = {
  Config: config,
  Base: (0, _ormBase["default"])(config)
};
var _default = ORM;
exports["default"] = _default;