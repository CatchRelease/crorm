"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RecordInvalidError = exports.RecordInvalidError = function (_Error) {
  _inherits(RecordInvalidError, _Error);

  function RecordInvalidError() {
    var _ref;

    _classCallCheck(this, RecordInvalidError);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = RecordInvalidError.__proto__ || Object.getPrototypeOf(RecordInvalidError)).call.apply(_ref, [this].concat(args)));

    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this, RecordInvalidError);
    }
    return _this;
  }

  return RecordInvalidError;
}(Error);