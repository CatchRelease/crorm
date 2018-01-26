'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ormBase = require('./orm/ormBase');

var _ormBase2 = _interopRequireDefault(_ormBase);

var _ormConfig = require('./orm/ormConfig');

var _ormConfig2 = _interopRequireDefault(_ormConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = new _ormConfig2.default();

var ORM = {
  Config: config,
  Base: _ormBase2.default
};

exports.default = ORM;