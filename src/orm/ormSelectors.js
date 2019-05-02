import Immutable from 'immutable';
import { createSelector } from 'reselect';

const getProps = (state, { key, ...rest }) => rest;
const getId = (state, props) => props.id;
const createGetPagination = (entityType) => (state, props) => (state.data.getIn(['pagination', entityType, props.key || entityType], Immutable.Map()) || Immutable.Map());

const createGetEntities = (entityType, filterAttribute, filterValue) => (state) => {
  const entities = state.data.getIn(['entities', entityType], Immutable.Map()) || Immutable.Map();

  if (filterAttribute && filterValue) {
    return entities.filter(entity => entity.get(filterAttribute) === filterValue);
  }

  return entities;
};

const createGetEntityOrder = (entityType) => (state, props) => (state.data.getIn(['entityOrder', entityType, props.key || entityType], Immutable.List()) || Immutable.List());

export const createEntitySelector = (entityType, filterAttribute, filterValue) => {
  const getEntities = createGetEntities(entityType, filterAttribute, filterValue);

  return createSelector([getId, getEntities], (id, entities) => (
    entities.find(entity => entity.get('id', '').toString() === id.toString(), null, null)
  ));
};

export const createEntitiesSelector = (entityType) => {
  const getEntities = createGetEntities(entityType);

  return createSelector([getEntities], (entities) => entities);
};

export const createWhereSelector = (entityType, filterAttribute, filterValue) => {
  const getEntities = createGetEntities(entityType, filterAttribute, filterValue);

  return createSelector([getProps, getEntities], (props, entities) => (
    entities.filter(entity => Object.keys(props).every(prop => {
      const key = prop;
      const value = props[prop] === 'id' ? props[prop].toString() : props[prop];
      const entityValue = entity.getIn([key], '');

      if (Array.isArray(value)) {
        return value.includes(entityValue);
      }

      return entityValue === value;
    }), null, Immutable.Map()
    )
  ));
};

export const createEntityOrderSelector = (entityType) => {
  const getEntityOrder = createGetEntityOrder(entityType);
  return createSelector([getEntityOrder], entityOrder => entityOrder);
};

export const createOrderedEntitiesSelector = (entityType, entitiesSelector) => {
  const getEntityOrder = createGetEntityOrder(entityType);

  return createSelector([entitiesSelector, getEntityOrder], (entityHash, entityOrder) => (
    Immutable.OrderedMap().withMutations(map => { // eslint-disable-line new-cap
      entityOrder.forEach((entityId, index) => {
        const entity = entityHash.get(entityId);

        if (entity) {
          map.set(index, entity);
        }
      });
    })
  ));
};

export const createPaginationSelector = (entityType) => {
  const getPagination = createGetPagination(entityType);

  return createSelector([getPagination], pagination => pagination);
};
