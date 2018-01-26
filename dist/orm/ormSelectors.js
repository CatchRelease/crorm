'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectPagination = exports.selectOrderedEntities = exports.selectEntityOrder = exports.selectEntitiesWhere = exports.selectEntities = exports.selectEntity = exports.getEntityOrder = undefined;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _pluralize = require('pluralize');

var _pluralize2 = _interopRequireDefault(_pluralize);

var _reselect = require('reselect');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var getProps = function getProps(state, props) {
  return props;
};
var getId = function getId(state, props) {
  return props.id;
};
var getEntityType = function getEntityType(state, props) {
  return props.entityType;
};
var getPagination = function getPagination(state, props) {
  return state.data.getIn(['pagination', props.entityType], _immutable2.default.Map()) || _immutable2.default.Map();
};
var getEntities = function getEntities(state, props) {
  return state.data.getIn(['entities', props.entityType], _immutable2.default.Map()) || _immutable2.default.Map();
};
var getEntityOrder = exports.getEntityOrder = function getEntityOrder(state, props) {
  return state.data.getIn(['entityOrder', props.entityType], _immutable2.default.List()) || _immutable2.default.List();
};

var getOrderedEntities = function getOrderedEntities(entityType, entityHash, entityOrder) {
  return _defineProperty({}, (0, _pluralize2.default)(entityType), _immutable2.default.OrderedMap().withMutations(function (map) {
    // eslint-disable-line new-cap
    entityOrder.forEach(function (entityId, index) {
      var entity = entityHash[(0, _pluralize2.default)(entityType)].get(entityId);

      if (entity) {
        map.set(index, entity);
      }
    });
  }));
};

var selectEntity = exports.selectEntity = (0, _reselect.createSelector)([getId, getEntityType, getEntities], function (id, entityType, entities) {
  return _defineProperty({}, entityType, entities.find(function (entity) {
    return entity.getIn(['id'], '').toString() === id.toString();
  }, null, _immutable2.default.Map()));
});

var selectEntities = exports.selectEntities = (0, _reselect.createSelector)([getEntityType, getEntities], function (entityType, entities) {
  return _defineProperty({}, (0, _pluralize2.default)(entityType), entities);
});

var selectEntitiesWhere = exports.selectEntitiesWhere = (0, _reselect.createSelector)([getProps, getEntityType, getEntities], function (props, entityType, entities) {
  var propsWithoutEntityType = Object.assign({}, props);
  delete propsWithoutEntityType.entityType;

  return _defineProperty({}, (0, _pluralize2.default)(entityType), entities.filter(function (entity) {
    return Object.keys(propsWithoutEntityType).every(function (prop) {
      var key = prop;
      var value = props[prop] === 'id' ? props[prop].toString() : props[prop];

      return entity.getIn([key], '') === value;
    });
  }, null, _immutable2.default.Map()));
});

var selectEntityOrder = exports.selectEntityOrder = (0, _reselect.createSelector)([getEntityOrder], function (entityOrder) {
  return {
    entityOrder: entityOrder
  };
});

var selectOrderedEntities = exports.selectOrderedEntities = (0, _reselect.createSelector)([getEntityType, selectEntities, getEntityOrder], getOrderedEntities);

var selectPagination = exports.selectPagination = (0, _reselect.createSelector)([getPagination], function (pagination) {
  return {
    pagination: pagination
  };
});