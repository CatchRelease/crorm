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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function DatabaseException(message) {
  this.message = message;
  this.name = 'DatabaseException';
}

var ORMBase = exports.ORMBase = function () {
  function ORMBase() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, ORMBase);

    this._listener = null;
    this.entity = null;
    this.id = null;

    this.changed = {};
    this.dirty = false;
    this.destroyed = false;

    if (data) {
      this.entity = data;
      this.id = data.get('id');
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

          var setter = {};
          setter[name] = value;

          if (target.entity.getIn([name], undefined) !== value) {
            target.dirty = true;

            var oldValue = target.changed[name] ? target.changed[name].oldValue : target.entity.getIn([name]);

            target.changed[name] = {
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
      var newEntity = ORMBase.database().data.getIn(['entities', entityType, this.id]);
      var same = currentEntity.equals(newEntity);

      if (!same) {
        if (newEntity === undefined) {
          this.destroy();
        } else {
          var changed = this.changed;

          if (Object.keys(this.changed).length) {
            var newProps = {};

            Object.keys(changed).forEach(function (change) {
              newProps[change] = changed[change].newValue;
            });

            this.entity = newEntity.merge(newProps);
            this.dirty = true;
          } else {
            this.entity = newEntity;
            this.dirty = false;
          }
        }
      }
    }
  }, {
    key: 'valid',
    value: function valid() {
      return true;
    }
  }, {
    key: 'changes',
    value: function changes() {
      return this.changed;
    }
  }, {
    key: 'save',
    value: function save() {
      if (this.valid()) {
        this.changed = {};
        this.onSave(this);

        return true;
      } else {
        return false;
      }
    }
  }, {
    key: 'update',
    value: function update(props) {
      var updateProps = Object.assign({}, props);
      this.entity = this.entity.merge(updateProps);

      if (this.valid()) {
        this.changed = {};
        this.onUpdate(this, props);

        return true;
      } else {
        return false;
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.destroyed = true;
      this.removeListener();

      this.onDestroy(this);
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
      return { data: _orm2.default.Config.database.getState() };
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

      if (immutable) {
        return entityOrder;
      } else {
        return entityOrder.entityOrder.toJS();
      }
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

      if (immutable) {
        return pagination;
      } else {
        return pagination.pagination.toJS();
      }
    }
  }, {
    key: 'find',
    value: function find(id) {
      var entityType = this.entityType();
      var entity = (0, _ormSelectors.selectEntity)(ORMBase.database(), { entityType: entityType, id: id });

      if (!entity) {
        throw new DatabaseException('Record not found.');
      }

      return new this(entity[entityType]);
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
    value: function create(attributes) {
      var model = new this(new _immutable2.default.Map(Object.assign({}, attributes)));
      model.onCreate(this, attributes);

      return model;
    }
  }]);

  return ORMBase;
}();

exports.default = ORMBase;

// Must haves