import Immutable from 'immutable';
import pluralize from 'pluralize';
import { createSelector } from 'reselect';

const getProps = (state, props) => props;
const getId = (state, props) => props.id;
const getEntityType = (state, props) => props.entityType;
const getPagination = (state, props) => (state.data.getIn(['pagination', props.entityType], Immutable.Map()) || Immutable.Map());
const getEntities = (state, props) => (state.data.getIn(['entities', props.entityType], Immutable.Map()) || Immutable.Map());
export const getEntityOrder = (state, props) => (state.data.getIn(['entityOrder', props.entityType], Immutable.List()) || Immutable.List());

const getOrderedEntities = (entityType, entityHash, entityOrder) => ({
  [pluralize(entityType)]: Immutable.OrderedMap().withMutations(map => { // eslint-disable-line new-cap
    entityOrder.forEach((entityId, index) => {
      const entity = entityHash[pluralize(entityType)].get(entityId);

      if (entity) {
        map.set(index, entity);
      }
    });
  })
});

export const selectEntity = createSelector([getId, getEntityType, getEntities], (id, entityType, entities) => ({
  [entityType]: entities.find(entity => entity.getIn(['id'], '').toString() === id.toString(), null, Immutable.Map())
}));

export const selectEntities = createSelector([getEntityType, getEntities], (entityType, entities) => ({
  [pluralize(entityType)]: entities
}));

export const selectEntitiesWhere = createSelector([getProps, getEntityType, getEntities], (props, entityType, entities) => {
  const propsWithoutEntityType = Object.assign({}, props);
  delete propsWithoutEntityType.entityType;

  return {
    [pluralize(entityType)]: entities.filter(entity =>
      Object.keys(propsWithoutEntityType).every(prop => {
        const key = prop;
        const value = props[prop] === 'id' ? props[prop].toString() : props[prop];
        const entityValue = entity.getIn([key], '');

        if (Array.isArray(value)) {
          return value.includes(entityValue);
        }

        return entityValue === value;
      }), null, Immutable.Map())
  };
});

export const selectEntityOrder = createSelector([getEntityOrder], (entityOrder) => ({
  entityOrder
}));

export const selectOrderedEntities = createSelector([getEntityType, selectEntities, getEntityOrder], getOrderedEntities);

export const selectPagination = createSelector([getPagination], (pagination) => ({
  pagination
}));
