'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require('immutable');

var _reselect = require('reselect');

var _orm = require('../orm');

var _orm2 = _interopRequireDefault(_orm);

var _ormSelectors = require('./ormSelectors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _default(recordProps, _recordType) {
  var EMPTY_PREDICATE = Object.freeze({});
  var builtIns = ['recordType', 'valid', 'updateProps', 'destroy', 'onCreate', 'onUpdate', 'onDestroy'];

  if (Object.keys(recordProps).some(function (prop) {
    return builtIns.includes(prop);
  })) {
    throw new Error('Cannot redefine built in params: ' + builtIns.join(', ') + '.');
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

  var ORMBase = function (_Record) {
    _inherits(ORMBase, _Record);

    function ORMBase() {
      _classCallCheck(this, ORMBase);

      return _possibleConstructorReturn(this, (ORMBase.__proto__ || Object.getPrototypeOf(ORMBase)).apply(this, arguments));
    }

    _createClass(ORMBase, [{
      key: 'valid',
      value: function valid() {
        // eslint-disable-line class-methods-use-this
        return true;
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
      key: 'recordType',
      value: function recordType() {
        return _recordType;
      }
    }, {
      key: 'order',
      value: function order() {
        return selectEntityOrder(ORMBase.database());
      }
    }, {
      key: 'ordered',
      value: function ordered() {
        var predicates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : EMPTY_PREDICATE;

        return selectOrderedEntities(ORMBase.database(), predicates);
      }
    }, {
      key: 'pagination',
      value: function pagination() {
        return selectPagination(ORMBase.database());
      }
    }, {
      key: 'findById',
      value: function findById() {
        var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

        return selectEntity(ORMBase.database(), { id: id.toString() });
      }
    }, {
      key: 'all',
      value: function all() {
        return selectEntities(ORMBase.database());
      }
    }, {
      key: 'where',
      value: function where(predicates) {
        return selectEntitiesWhere(ORMBase.database(), predicates);
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

  return ORMBase;
}
exports.default = _default;