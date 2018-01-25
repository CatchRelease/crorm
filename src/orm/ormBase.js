import Immutable from 'immutable';
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

export class ORMBase {
  constructor(data = null) {
    this._listener = null;
    this.entity = null;
    this.id = null;

    this._changed = {};
    this._dirty = false;
    this._destroyed = false;

    if (data) {
      this.entity = data;
      this.id = data.get('id');
    }

    this.addListener();

    return new Proxy(this, {
      get: (target, name) => {
        if (!(name in target)) {
          return target.entity.getIn([name], undefined);
        }

        return target[name];
      },
      set: (target, name, value) => {
        if (!(name in target)) {
          const setter = {
            [name]: value
          };

          if (target.entity.getIn([name], undefined) !== value) {
            target._dirty = true;

            const oldValue = target._changed[name] ?
              target._changed[name].oldValue :
              target.entity.getIn([name]);

            target._changed[name] = {
              newValue: value,
              oldValue
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
    const results = [];

    if (!entities[pluralize(entityType)].isEmpty()) {
      entities[pluralize(entityType)].forEach(entity => {
        results.push(new this(entity));
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

  static find(id) {
    const entityType = this.entityType();
    const entity = selectEntity(ORMBase.database(), { entityType, id });
    let returnValue = null;

    if (!entity[entityType].isEmpty()) {
      returnValue = new this(entity[entityType]);
    }

    return returnValue;
  }

  static all() {
    const entityType = this.entityType();
    const entities = selectEntities(ORMBase.database(), { entityType });
    const results = [];

    if (!entities[pluralize(entityType)].isEmpty()) {
      entities[pluralize(entityType)].forEach(entity => {
        results.push(new this(entity));
      });
    }

    return results;
  }

  static where(props) {
    const entityType = this.entityType();
    const propsWithType = Object.assign({}, props, { entityType });
    const entities = selectEntitiesWhere(ORMBase.database(), propsWithType);
    const results = [];

    if (!entities[pluralize(entityType)].isEmpty()) {
      entities[pluralize(entityType)].forEach(entity => {
        results.push(new this(entity));
      });
    }

    return results;
  }

  static create(attributes = {}) {
    const model = new this(new Immutable.Map(Object.assign({}, attributes)));
    const dispatch = ORMBase.dispatch();

    model.onCreate(model, attributes, dispatch);

    return model;
  }

  entityType() {
    return this.constructor.name.toLowerCase();
  }

  addListener() {
    this._listener = ORM.Config.database.subscribe(() => this.handleChanges());
  }

  removeListener() {
    this._listener();
  }

  handleChanges() {
    const entityType = this.entityType();
    const currentEntity = this.entity;
    const id = this.id ? this.id.toString() : null;

    const newEntity = ORMBase.database().data.getIn(['entities', entityType, id]);
    const same = currentEntity.equals(newEntity);

    if (!same) {
      if (newEntity === undefined) {
        // Odd case, not sure what to do
      } else {
        const changed = this._changed;

        if (Object.keys(changed).length) {
          const newProps = {};

          Object.keys(changed).forEach(change => { newProps[change] = changed[change].newValue; });

          this.entity = newEntity.merge(newProps);
          this._dirty = true;
        } else {
          this.entity = newEntity;
          this._dirty = false;
        }
      }
    }
  }

  valid() { // eslint-disable-line class-methods-use-this
    return true;
  }

  changes() {
    return this._changed;
  }

  save() {
    let saved;

    if (this.valid()) {
      this._changed = {};
      this.onSave(this, ORMBase.dispatch());

      saved = true;
    } else {
      saved = false;
    }

    return saved;
  }

  update(props = {}) {
    const updateProps = Object.assign({}, props);
    this.entity = this.entity.merge(updateProps);
    let updated;

    if (this.valid()) {
      this.onUpdate(this, updateProps, ORMBase.dispatch());
      this._changed = {};

      updated = true;
    } else {
      updated = false;
    }

    return updated;
  }

  destroy() {
    this._destroyed = true;
    this.removeListener();

    this.onDestroy(this, ORMBase.dispatch());
  }

  onCreate() {
    return this;
  }

  onSave() {
    return this;
  }

  onUpdate() {
    return this;
  }

  onDestroy() {
    return this;
  }
}

export default ORMBase;
