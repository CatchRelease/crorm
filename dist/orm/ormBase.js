"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = baseBuilder;

var _immutable = require("immutable");

var _reselect = require("reselect");

var _ormSelectors = require("./ormSelectors");

var _ormErrors = require("./ormErrors");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function recordWrapper(config, recordProps, _recordType) {
  var EMPTY_PREDICATE = Object.freeze({});
  var builtIns = ['recordType', 'valid', 'updateProps', 'destroy', 'onCreate', 'onUpdate', 'onDestroy'];

  if (Object.keys(recordProps).some(function (prop) {
    return builtIns.includes(prop);
  })) {
    throw new Error("Cannot redefine built in params: ".concat(builtIns.join(', '), "."));
  }

  var selectEntities = (0, _ormSelectors.createEntitiesSelector)(_recordType);
  var selectEntity = (0, _ormSelectors.createEntitySelector)(_recordType);
  var selectEntitiesWhere = (0, _reselect.createSelector)([(0, _ormSelectors.createWhereSelector)(_recordType)], function (entities) {
    return entities.toList();
  });
  var selectEntityOrder = (0, _ormSelectors.createEntityOrderSelector)(_recordType);
  var selectPagination = (0, _ormSelectors.createPaginationSelector)(_recordType);
  var selectOrderedEntities = (0, _reselect.createSelector)([(0, _ormSelectors.createOrderedEntitiesSelector)(_recordType, (0, _ormSelectors.createWhereSelector)(_recordType))], function (entities) {
    return entities.toList();
  });

  var ORMBase = /*#__PURE__*/function (_Record) {
    _inherits(ORMBase, _Record);

    var _super = _createSuper(ORMBase);

    function ORMBase() {
      _classCallCheck(this, ORMBase);

      return _super.apply(this, arguments);
    }

    _createClass(ORMBase, [{
      key: "valid",
      value: function valid() {
        // eslint-disable-line class-methods-use-this
        return true;
      }
    }, {
      key: "updateProps",
      value: function updateProps() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (this.valid()) {
          return this.onUpdate(ORMBase.dispatch(), _objectSpread({}, props));
        }

        return Promise.reject(new _ormErrors.RecordInvalidError('record invalid!'));
      }
    }, {
      key: "destroy",
      value: function destroy() {
        return this.onDestroy(ORMBase.dispatch());
      }
    }, {
      key: "onCreate",
      value: function onCreate() {
        return Promise.resolve(this);
      }
    }, {
      key: "onUpdate",
      value: function onUpdate(_dispatch, props) {
        var updatedRecord = this.merge(props);
        return Promise.resolve(updatedRecord);
      }
    }, {
      key: "onDestroy",
      value: function onDestroy() {
        return Promise.resolve(this.clear());
      }
    }], [{
      key: "database",
      value: function database() {
        return config.database.getState();
      }
    }, {
      key: "dispatch",
      value: function dispatch() {
        return config.database.dispatch;
      }
    }, {
      key: "recordType",
      value: function recordType() {
        return _recordType;
      }
    }, {
      key: "order",
      value: function order() {
        var predicates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : EMPTY_PREDICATE;
        return selectEntityOrder(ORMBase.database(), predicates);
      }
    }, {
      key: "ordered",
      value: function ordered() {
        var predicates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : EMPTY_PREDICATE;
        return selectOrderedEntities(ORMBase.database(), predicates);
      }
    }, {
      key: "pagination",
      value: function pagination() {
        var predicates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : EMPTY_PREDICATE;
        return selectPagination(ORMBase.database(), predicates);
      }
    }, {
      key: "findById",
      value: function findById() {
        var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        return selectEntity(ORMBase.database(), {
          id: id.toString()
        });
      }
    }, {
      key: "all",
      value: function all() {
        return selectEntities(ORMBase.database());
      }
    }, {
      key: "where",
      value: function where(predicates) {
        return selectEntitiesWhere(ORMBase.database(), predicates);
      }
    }, {
      key: "create",
      value: function create() {
        var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var model = new this(_objectSpread({}, attributes));

        for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }

        return model.onCreate.apply(model, [ORMBase.dispatch(), attributes].concat(rest));
      }
    }]);

    return ORMBase;
  }((0, _immutable.Record)(recordProps));

  return ORMBase;
}

function baseBuilder(config) {
  return recordWrapper.bind(this, config);
}