/* eslint no-console: 0 */

import Immutable, { Record } from 'immutable';
import pluralize from 'pluralize';

import {
  selectEntity,
  selectEntities,
  selectEntitiesWhere,
  selectEntityOrder,
  selectOrderedEntities,
  selectPagination
} from './ormSelectors';

import ORM from '../orm';

export default function(recordProps) {
  return class ORMBase extends Record(recordProps) {
    static database() {
      return ORM.Config.database.getState();
    }

    static dispatch() {
      return ORM.Config.database.dispatch;
    }

    static entityType() {
      return this.name.toLowerCase();
    }

    static order(immutable = false) {
      const entityType = this.entityType();
      const entityOrder = selectEntityOrder(ORMBase.database(), { entityType });
      let returnValue;

      if (immutable) {
        returnValue = entityOrder;
      } else {
        returnValue = entityOrder.entityOrder.toJS();
      }

      return returnValue;
    }

    static ordered() {
      const entityType = this.entityType();
      const entities = selectOrderedEntities(ORMBase.database(), { entityType });
      let results = Immutable.List();

      if (!entities[pluralize(entityType)].isEmpty()) {
        entities[pluralize(entityType)].forEach(entity => {
          const newRecord = new this(entity);
          results = results.push(newRecord);
        });
      }

      return results;
    }

    static pagination(immutable = false) {
      const entityType = this.entityType();
      const pagination = selectPagination(ORMBase.database(), { entityType });
      let returnValue;

      if (immutable) {
        returnValue = pagination;
      } else {
        returnValue = pagination.pagination.toJS();
      }

      return returnValue;
    }

    static findById(id = '') {
      const entityType = this.entityType();
      const entity = selectEntity(ORMBase.database(), { entityType, id: id.toString() });
      let returnValue = new this({ id: id.toString() });

      if (ORM.Config.debug) {
        console.log(`Called method findById with ${id}`);
        console.log('EntityType:', this.entityType());
        console.log('Database:', ORMBase.database().data.toJS());
        console.log('Entity:', entity);
      }

      if (!entity[entityType].isEmpty()) {
        if (ORM.Config.debug) {
          console.log('Entity is not empty', entity[entityType]);
        }

        returnValue = new this(entity[entityType]);
      } else if (ORM.Config.debug) {
        console.log('Entity is empty');
      }

      return returnValue;
    }

    static all() {
      const entityType = this.entityType();
      const entities = selectEntities(ORMBase.database(), { entityType });
      let results = Immutable.List();

      if (!entities[pluralize(entityType)].isEmpty()) {
        entities[pluralize(entityType)].forEach(entity => {
          results = results.push(new this(entity));
        });
      }

      return results;
    }

    static where(props) {
      const entityType = this.entityType();
      const propsWithType = Object.assign({}, props, { entityType });
      const entities = selectEntitiesWhere(ORMBase.database(), propsWithType);
      let results = Immutable.List();

      if (!entities[pluralize(entityType)].isEmpty()) {
        entities[pluralize(entityType)].forEach(entity => {
          results = results.push(new this(entity));
        });
      }

      return results;
    }

    static create(attributes = {}) {
      const model = new this(Object.assign({}, attributes));
      const dispatch = ORMBase.dispatch();

      model.onCreate(model, attributes, dispatch);

      return model;
    }

    entityType() {
      return this.constructor.name.toLowerCase();
    }

    valid() { // eslint-disable-line class-methods-use-this
      return true;
    }

    changes() {
      return this._changed;
    }

    updateProps(props = {}) {
      const updateProps = Object.assign({}, props);
      let returnInstance = this;

      if (this.valid()) {
        this.onUpdate(this, updateProps, ORMBase.dispatch());
        returnInstance = this.merge(updateProps);
      }

      return returnInstance;
    }

    destroy() {
      this.onDestroy(this, ORMBase.dispatch());

      return this.clear();
    }

    onCreate() {
      return this;
    }

    onUpdate() {
      return this;
    }

    onDestroy() {
      return this;
    }
  };
}
