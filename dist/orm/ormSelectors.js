'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPaginationSelector = exports.createOrderedEntitiesSelector = exports.createEntityOrderSelector = exports.createWhereSelector = exports.createEntitiesSelector = exports.createEntitySelector = undefined;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _reselect = require('reselect');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getProps = function getProps(state, props) {
  return props;
};
var getId = function getId(state, props) {
  return props.id;
};
var createGetPagination = function createGetPagination(entityType) {
  return function (state) {
    return state.data.getIn(['pagination', entityType], _immutable2.default.Map()) || _immutable2.default.Map();
  };
};
var createGetEntities = function createGetEntities(entityType) {
  return function (state) {
    return state.data.getIn(['entities', entityType], _immutable2.default.Map()) || _immutable2.default.Map();
  };
};
var createGetEntityOrder = function createGetEntityOrder(entityType) {
  return function (state) {
    return state.data.getIn(['entityOrder', entityType], _immutable2.default.List()) || _immutable2.default.List();
  };
};

var createEntitySelector = exports.createEntitySelector = function createEntitySelector(entityType) {
  var getEntities = createGetEntities(entityType);

  return (0, _reselect.createSelector)([getId, getEntities], function (id, entities) {
    return entities.find(function (entity) {
      return entity.get('id', '').toString() === id.toString();
    }, null, null);
  });
};

var createEntitiesSelector = exports.createEntitiesSelector = function createEntitiesSelector(entityType) {
  var getEntities = createGetEntities(entityType);

  return (0, _reselect.createSelector)([getEntities], function (entities) {
    return entities;
  });
};

var createWhereSelector = exports.createWhereSelector = function createWhereSelector(entityType) {
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
    }, null, _immutable2.default.Map());
  });
};

var createEntityOrderSelector = exports.createEntityOrderSelector = function createEntityOrderSelector(entityType) {
  var getEntityOrder = createGetEntityOrder(entityType);
  return (0, _reselect.createSelector)([getEntityOrder], function (entityOrder) {
    return entityOrder;
  });
};

var createOrderedEntitiesSelector = exports.createOrderedEntitiesSelector = function createOrderedEntitiesSelector(entityType, entitiesSelector) {
  var getEntityOrder = createGetEntityOrder(entityType);

  return (0, _reselect.createSelector)([entitiesSelector, getEntityOrder], function (entityHash, entityOrder) {
    return _immutable2.default.OrderedMap().withMutations(function (map) {
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

var createPaginationSelector = exports.createPaginationSelector = function createPaginationSelector(entityType) {
  var getPagination = createGetPagination(entityType);

  return (0, _reselect.createSelector)([getPagination], function (pagination) {
    return pagination;
  });
};