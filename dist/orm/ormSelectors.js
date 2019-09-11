"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPaginationSelector = exports.createOrderedEntitiesSelector = exports.createEntityOrderSelector = exports.createWhereSelector = exports.createEntitiesSelector = exports.createEntitySelector = void 0;

var _immutable = _interopRequireDefault(require("immutable"));

var _reselect = require("reselect");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var getProps = function getProps(state, _ref) {
  var key = _ref.key,
      rest = _objectWithoutProperties(_ref, ["key"]);

  return rest;
};

var getId = function getId(state, props) {
  return props.id;
};

var createGetPagination = function createGetPagination(entityType) {
  return function (state, props) {
    return state.data.getIn(['pagination', entityType, props.key || entityType], _immutable["default"].Map()) || _immutable["default"].Map();
  };
};

var createGetEntities = function createGetEntities(entityType) {
  return function (state) {
    return state.data.getIn(['entities', entityType], _immutable["default"].Map()) || _immutable["default"].Map();
  };
};

var createGetEntityOrder = function createGetEntityOrder(entityType) {
  return function (state, props) {
    return state.data.getIn(['entityOrder', entityType, props.key || entityType], _immutable["default"].List()) || _immutable["default"].List();
  };
};

var createEntitySelector = function createEntitySelector(entityType) {
  var getEntities = createGetEntities(entityType);
  return (0, _reselect.createSelector)([getId, getEntities], function (id, entities) {
    return entities.find(function (entity) {
      return entity.get('id', '').toString() === id.toString();
    }, null, null);
  });
};

exports.createEntitySelector = createEntitySelector;

var createEntitiesSelector = function createEntitiesSelector(entityType) {
  var getEntities = createGetEntities(entityType);
  return (0, _reselect.createSelector)([getEntities], function (entities) {
    return entities;
  });
};

exports.createEntitiesSelector = createEntitiesSelector;

var createWhereSelector = function createWhereSelector(entityType) {
  var getEntities = createGetEntities(entityType);
  return (0, _reselect.createSelector)([getProps, getEntities], function (props, entities) {
    return entities.filter(function (entity) {
      return Object.keys(props).every(function (prop) {
        var key = prop;
        var value = props[prop] === 'id' ? props[prop].toString() : props[prop];
        var entityValue = entity.getIn([key], '');

        if (Array.isArray(value)) {
          return value.includes(entityValue);
        }

        return entityValue === value;
      });
    }, null, _immutable["default"].Map());
  });
};

exports.createWhereSelector = createWhereSelector;

var createEntityOrderSelector = function createEntityOrderSelector(entityType) {
  var getEntityOrder = createGetEntityOrder(entityType);
  return (0, _reselect.createSelector)([getEntityOrder], function (entityOrder) {
    return entityOrder;
  });
};

exports.createEntityOrderSelector = createEntityOrderSelector;

var createOrderedEntitiesSelector = function createOrderedEntitiesSelector(entityType, entitiesSelector) {
  var getEntityOrder = createGetEntityOrder(entityType);
  return (0, _reselect.createSelector)([entitiesSelector, getEntityOrder], function (entityHash, entityOrder) {
    return _immutable["default"].OrderedMap().withMutations(function (map) {
      // eslint-disable-line new-cap
      entityOrder.forEach(function (entityId, index) {
        var entity = entityHash.get(entityId);

        if (entity) {
          map.set(index, entity);
        }
      });
    });
  });
};

exports.createOrderedEntitiesSelector = createOrderedEntitiesSelector;

var createPaginationSelector = function createPaginationSelector(entityType) {
  var getPagination = createGetPagination(entityType);
  return (0, _reselect.createSelector)([getPagination], function (pagination) {
    return pagination;
  });
};

exports.createPaginationSelector = createPaginationSelector;