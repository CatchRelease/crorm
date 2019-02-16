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

export default function(recordProps, recordType) {
  const EMPTY_PREDICATE = Object.freeze({});
  const builtIns = ['recordType', 'valid', 'updateProps', 'destroy', 'onCreate', 'onUpdate', 'onDestroy'];

  if (Object.keys(recordProps).some(prop => builtIns.includes(prop))) {
    throw new Error(`Cannot redefine built in params: ${builtIns.join(', ')}.`);
  }

  const selectEntities = createEntitiesSelector(recordType);
  const selectEntity = createEntitySelector(recordType);
  const selectEntitiesWhere = createSelector([createWhereSelector(recordType)], entities => entities.toList());
  const selectEntityOrder = createEntityOrderSelector(recordType);
  const selectPagination = createPaginationSelector(recordType);
  const selectOrderedEntities = createSelector([createOrderedEntitiesSelector(recordType, createWhereSelector(recordType))], (entities) => entities.toList());

  class ORMBase extends Record(recordProps) {
    static database() {
      return ORM.Config.database.getState();
    }

    static dispatch() {
      return ORM.Config.database.dispatch;
    }

    static recordType() {
      return recordType;
    }

    static order() {
      return selectEntityOrder(ORMBase.database());
    }

    static ordered(predicates = EMPTY_PREDICATE) {
      return selectOrderedEntities(ORMBase.database(), predicates);
    }

    static pagination() {
      return selectPagination(ORMBase.database());
    }

    static findById(id = '') {
      return selectEntity(ORMBase.database(), { id: id.toString() });
    }

    static all() {
      return selectEntities(ORMBase.database());
    }

    static where(predicates) {
      return selectEntitiesWhere(ORMBase.database(), predicates);
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
