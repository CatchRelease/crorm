import { Record } from 'immutable';
import { createSelector } from 'reselect';

import ORM from '../orm';
import {
  createEntitiesSelector,
  createEntityOrderSelector,
  createEntitySelector,
  createOrderedEntitiesSelector,
  createPaginationSelector,
  createWhereSelector
} from './ormSelectors';
import { RecordInvalidError } from './ormErrors';

export default function(recordProps, recordType, options = {}) {
  const EMPTY_PREDICATE = Object.freeze({});
  const builtIns = [
    'destroy',
    'isStiRecord',
    'onCreate',
    'onDestroy',
    'onUpdate',
    'recordType',
    'updateProps',
    'valid'
  ];

  if (Object.keys(recordProps).some(prop => builtIns.includes(prop))) {
    throw new Error(`Cannot redefine built in params: ${builtIns.join(', ')}.`);
  }

  const { stiDifferentiator = {} } = options;

  const recordTypes = [recordType, ...(Object.keys(stiDifferentiator) || [])];

  const selectors = recordTypes.reduce((memo, entityType) => {
    const filterValue = entityType === recordType ? null : stiDifferentiator[entityType].value;
    const filterAttribute = entityType === recordType ? null : stiDifferentiator[entityType].attribute;

    memo[entityType] = {
      selectEntities: createEntitiesSelector(recordType, filterAttribute, filterValue),
      selectEntity: createEntitySelector(recordType),
      selectEntitiesWhere: createSelector([createWhereSelector(recordType, filterAttribute, filterValue)], entities => entities.toList()),
      selectEntityOrder: createEntityOrderSelector(recordType),
      selectPagination: createPaginationSelector(recordType),
      selectOrderedEntities: createSelector([createOrderedEntitiesSelector(recordType, createWhereSelector(recordType))], (entities) => entities.toList())
    };

    return memo;
  }, {});

  class ORMBase extends Record(recordProps) {
    static database() {
      return ORM.Config.database.getState();
    }

    static dispatch() {
      return ORM.Config.database.dispatch;
    }

    static isStiRecord() {
      return !!options.stiDifferentiator;
    }

    static recordType() {
      return recordType;
    }

    static order(predicates = EMPTY_PREDICATE) {
      return selectors[this.recordType()].selectEntityOrder(ORMBase.database(), predicates);
    }

    static ordered(predicates = EMPTY_PREDICATE) {
      return selectors[this.recordType()].selectOrderedEntities(ORMBase.database(), predicates);
    }

    static pagination(predicates = EMPTY_PREDICATE) {
      return selectors[this.recordType()].selectPagination(ORMBase.database(), predicates);
    }

    static findById(id = '') {
      return selectors[this.recordType()].selectEntity(ORMBase.database(), { id: id.toString() });
    }

    static all() {
      return selectors[this.recordType()].selectEntities(ORMBase.database());
    }

    static where(predicates) {
      return selectors[this.recordType()].selectEntitiesWhere(ORMBase.database(), predicates);
    }

    static create(attributes = {}) {
      const model = new this({ ...attributes });

      return model.onCreate(ORMBase.dispatch(), attributes);
    }

    valid() { // eslint-disable-line class-methods-use-this
      return true;
    }

    updateProps(props = {}) {
      if (this.valid()) {
        return this.onUpdate(ORMBase.dispatch(), { ...props });
      }

      return Promise.reject(new RecordInvalidError('record invalid!'));
    }

    destroy() {
      return this.onDestroy(ORMBase.dispatch());
    }

    onCreate() {
      return Promise.resolve(this);
    }

    onUpdate(_dispatch, props) {
      const updatedRecord = this.merge(props);

      return Promise.resolve(updatedRecord);
    }

    onDestroy() {
      return Promise.resolve(this.clear());
    }
  }

  return ORMBase;
}
