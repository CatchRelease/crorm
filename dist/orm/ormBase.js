'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ORMBase = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _pluralize = require('pluralize');

var _pluralize2 = _interopRequireDefault(_pluralize);

var _ormSelectors = require('./ormSelectors');

var _orm = require('../orm');

var _orm2 = _interopRequireDefault(_orm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ORMBase = exports.ORMBase = function () {
  function ORMBase() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, ORMBase);

    this._listener = null;
    this.entity = null;
    this.id = null;

    this._changed = {};
    this._dirty = false;
    this._destroyed = false;

    if (data) {
      var immutableData = _immutable2.default.Iterable.isIterable(data) ? data : _immutable2.default.fromJS(data);

      this.entity = immutableData;
      this.id = immutableData.getIn(['id'], '').toString();
    } else {
      this.entity = new _immutable2.default.Map();
      this.id = null;
    }

    this.addListener();

    return new Proxy(this, {
      get: function get(target, name) {
        if (!(name in target)) {
          return target.entity.getIn([name], undefined);
        }

        return target[name];
      },
      set: function set(target, name, value) {
        if (!(name in target)) {
          var setter = _defineProperty({}, name, value);

          if (target.entity.getIn([name], undefined) !== value) {
            target._dirty = true;

            var oldValue = target._changed[name] ? target._changed[name].oldValue : target.entity.getIn([name]);

            target._changed[name] = {
              newValue: value,
              oldValue: oldValue
            };
          }

          target.entity = target.entity.merge(setter);
        } else {
          target[name] = value;
        }

        return true;
      }
    });
  }

  _createClass(ORMBase, [{
    key: '_clone',
    value: function _clone() {
      var clone = new this.constructor(this.entity);
      clone._dirty = this._dirty;
      clone._destroyed = this._destroyed;

      return clone;
    }
  }, {
    key: 'entityType',
    value: function entityType() {
      return this.constructor.name.toLowerCase();
    }
  }, {
    key: 'addListener',
    value: function addListener() {
      var _this = this;

      this._listener = _orm2.default.Config.database.subscribe(function () {
        return _this.handleChanges();
      });
    }
  }, {
    key: 'removeListener',
    value: function removeListener() {
      this._listener();
    }
  }, {
    key: 'handleChanges',
    value: function handleChanges() {
      var entityType = this.entityType();
      var currentEntity = this.entity;
      var id = this.id ? this.id.toString() : null;

      var newEntity = ORMBase.database().data.getIn(['entities', entityType, id]);
      var same = currentEntity.equals(newEntity);

      if (!same) {
        if (newEntity === undefined) {
          // Odd case, not sure what to do
        } else {
          var changed = this._changed;

          if (Object.keys(changed).length) {
            var newProps = {};

            Object.keys(changed).forEach(function (change) {
              newProps[change] = changed[change].newValue;
            });

            this.entity = newEntity.merge(newProps);
            this._dirty = true;
          } else {
            this.entity = newEntity;
            this._dirty = false;
          }
        }
      }
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
    key: 'save',
    value: function save() {
      var returnInstance = this;

      if (this.valid()) {
        this._changed = {};
        this.onSave(this, this.entity.toJS(), ORMBase.dispatch());

        returnInstance = this._clone();
      }

      return returnInstance;
    }
  }, {
    key: 'update',
    value: function update() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var updateProps = Object.assign({}, props);
      var returnInstance = this;

      if (this.valid()) {
        this.entity = this.entity.merge(updateProps);
        this.onUpdate(this, updateProps, ORMBase.dispatch());
        returnInstance = this._clone();
      }

      return returnInstance;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._destroyed = true;
      this.removeListener();

      this.onDestroy(this, ORMBase.dispatch());

      return this._clone();
    }
  }, {
    key: 'onCreate',
    value: function onCreate() {
      return this;
    }
  }, {
    key: 'onSave',
    value: function onSave() {
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
      var results = [];

      if (!entities[(0, _pluralize2.default)(entityType)].isEmpty()) {
        entities[(0, _pluralize2.default)(entityType)].forEach(function (entity) {
          results.push(new _this2(entity));
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
    key: 'find',
    value: function find() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var entityType = this.entityType();
      var entity = (0, _ormSelectors.selectEntity)(ORMBase.database(), { entityType: entityType, id: id.toString() });
      var returnValue = new this();

      if (!entity[entityType].isEmpty()) {
        returnValue = new this(entity[entityType]);
      }

      return returnValue;
    }
  }, {
    key: 'all',
    value: function all() {
      var _this3 = this;

      var entityType = this.entityType();
      var entities = (0, _ormSelectors.selectEntities)(ORMBase.database(), { entityType: entityType });
      var results = [];

      if (!entities[(0, _pluralize2.default)(entityType)].isEmpty()) {
        entities[(0, _pluralize2.default)(entityType)].forEach(function (entity) {
          results.push(new _this3(entity));
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
      var results = [];

      if (!entities[(0, _pluralize2.default)(entityType)].isEmpty()) {
        entities[(0, _pluralize2.default)(entityType)].forEach(function (entity) {
          results.push(new _this4(entity));
        });
      }

      return results;
    }
  }, {
    key: 'create',
    value: function create() {
      var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var model = new this(new _immutable2.default.Map(Object.assign({}, attributes)));
      var dispatch = ORMBase.dispatch();

      model.onCreate(model, attributes, dispatch);

      return model;
    }
  }]);

  return ORMBase;
}();

exports.default = ORMBase;