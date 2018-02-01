'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (recordProps) {
  return function (_Record) {
    _inherits(ORMBase, _Record);

    function ORMBase() {
      _classCallCheck(this, ORMBase);

      return _possibleConstructorReturn(this, (ORMBase.__proto__ || Object.getPrototypeOf(ORMBase)).apply(this, arguments));
    }

    _createClass(ORMBase, [{
      key: 'entityType',
      value: function entityType() {
        return this.constructor.name.toLowerCase();
      }
    }, {
      key: 'valid',
      value: function valid() {
        // eslint-disable-line class-methods-use-this
        return true;
      }
    }, {
      key: 'changes',
      value: function changes() {
        return this._changed;
      }
    }, {
      key: 'updateProps',
      value: function updateProps() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var updateProps = Object.assign({}, props);
        var returnInstance = this;

        if (this.valid()) {
          this.onUpdate(this, updateProps, ORMBase.dispatch());
          returnInstance = this.merge(updateProps);
        }

        return returnInstance;
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.onDestroy(this, ORMBase.dispatch());

        return this.clear();
      }
    }, {
      key: 'onCreate',
      value: function onCreate() {
        return this;
      }
    }, {
      key: 'onUpdate',
      value: function onUpdate() {
        return this;
      }
    }, {
      key: 'onDestroy',
      value: function onDestroy() {
        return this;
      }
    }], [{
      key: 'database',
      value: function database() {
        return _orm2.default.Config.database.getState();
      }
    }, {
      key: 'dispatch',
      value: function dispatch() {
        return _orm2.default.Config.database.dispatch;
      }
    }, {
      key: 'entityType',
      value: function entityType() {
        return this.name.toLowerCase();
      }
    }, {
      key: 'order',
      value: function order() {
        var immutable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var entityType = this.entityType();
        var entityOrder = (0, _ormSelectors.selectEntityOrder)(ORMBase.database(), { entityType: entityType });
        var returnValue = void 0;

        if (immutable) {
          returnValue = entityOrder;
        } else {
          returnValue = entityOrder.entityOrder.toJS();
        }

        return returnValue;
      }
    }, {
      key: 'ordered',
      value: function ordered() {
        var _this2 = this;

        var entityType = this.entityType();
        var entities = (0, _ormSelectors.selectOrderedEntities)(ORMBase.database(), { entityType: entityType });
        var results = _immutable2.default.List();

        if (!entities[(0, _pluralize2.default)(entityType)].isEmpty()) {
          entities[(0, _pluralize2.default)(entityType)].forEach(function (entity) {
            var newRecord = new _this2(entity);
            results = results.push(newRecord);
          });
        }

        return results;
      }
    }, {
      key: 'pagination',
      value: function pagination() {
        var immutable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var entityType = this.entityType();
        var pagination = (0, _ormSelectors.selectPagination)(ORMBase.database(), { entityType: entityType });
        var returnValue = void 0;

        if (immutable) {
          returnValue = pagination;
        } else {
          returnValue = pagination.pagination.toJS();
        }

        return returnValue;
      }
    }, {
      key: 'findById',
      value: function findById() {
        var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

        var entityType = this.entityType();
        var entity = (0, _ormSelectors.selectEntity)(ORMBase.database(), { entityType: entityType, id: id.toString() });
        var returnValue = new this({ id: id.toString() });

        if (_orm2.default.Config.debug) {
          console.log('Called method findById with ' + id);
          console.log('EntityType:', this.entityType());
          console.log('Database:', ORMBase.database().data.toJS());
          console.log('Entity:', entity);
        }

        if (!entity[entityType].isEmpty()) {
          if (_orm2.default.Config.debug) {
            console.log('Entity is not empty', entity[entityType]);
          }

          returnValue = new this(entity[entityType]);
        } else if (_orm2.default.Config.debug) {
          console.log('Entity is empty');
        }

        return returnValue;
      }
    }, {
      key: 'all',
      value: function all() {
        var _this3 = this;

        var entityType = this.entityType();
        var entities = (0, _ormSelectors.selectEntities)(ORMBase.database(), { entityType: entityType });
        var results = _immutable2.default.List();

        if (!entities[(0, _pluralize2.default)(entityType)].isEmpty()) {
          entities[(0, _pluralize2.default)(entityType)].forEach(function (entity) {
            results = results.push(new _this3(entity));
          });
        }

        return results;
      }
    }, {
      key: 'where',
      value: function where(props) {
        var _this4 = this;

        var entityType = this.entityType();
        var propsWithType = Object.assign({}, props, { entityType: entityType });
        var entities = (0, _ormSelectors.selectEntitiesWhere)(ORMBase.database(), propsWithType);
        var results = _immutable2.default.List();

        if (!entities[(0, _pluralize2.default)(entityType)].isEmpty()) {
          entities[(0, _pluralize2.default)(entityType)].forEach(function (entity) {
            results = results.push(new _this4(entity));
          });
        }

        return results;
      }
    }, {
      key: 'create',
      value: function create() {
        var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var model = new this(Object.assign({}, attributes));
        var dispatch = ORMBase.dispatch();

        model.onCreate(model, attributes, dispatch);

        return model;
      }
    }]);

    return ORMBase;
  }((0, _immutable.Record)(recordProps));
};

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _pluralize = require('pluralize');

var _pluralize2 = _interopRequireDefault(_pluralize);

var _ormSelectors = require('./ormSelectors');

var _orm = require('../orm');

var _orm2 = _interopRequireDefault(_orm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint no-console: 0 */