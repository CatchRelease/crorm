import Immutable from 'immutable';
import ORM from '../src/orm';
import { store, updateShot } from './createStore';
import { DatabaseException } from '../src/orm/ormExceptions';

const { spyOn } = jest;

ORM.Config.database = store;

const onCreateSpy = jest.fn();
const onSaveSpy = jest.fn();
const onUpdateSpy = jest.fn();
const onDestroySpy = jest.fn();

class Shot extends ORM.Base {
  valid() {
    return !!this.projectId;
  }

  onCreate(shot, attributes)  {
    onCreateSpy(shot, attributes);
  }

  onSave(shot)  {
    onSaveSpy(shot);
  }

  onUpdate(shot, attributes)  {
    onUpdateSpy(shot, attributes);
  }

  onDestroy(shot) {
    onDestroySpy(shot);
  }
}

describe('Setup', () => {
  test('store is setup', () => {
    expect(store).toBeDefined();
  });
});

describe('Base Class', () => {
  test('exsts', () => {
    expect(ORM.Base).toBeDefined();
  });

  describe('Class Methods', () => {
    describe('database', () => {
      test('returns an object', () => {
        expect(ORM.Base.database()).toBeInstanceOf(Object);
      });

      test('has a data member', () => {
        expect(ORM.Base.database().data).toBeDefined();
      });

      test('data is the store state', () => {
        expect(ORM.Base.database().data).toEqual(store.getState());
      });
    });

    describe('entityType', () => {
      test('returns lowercase class name', () => {
        expect(ORM.Base.entityType()).toEqual('ormbase');
      });
    });

    describe('order', () => {
      test('method exists', () => {
        expect(ORM.Base.order).toBeDefined();
      });
    });

    describe('ordered', () => {
      test('method exists', () => {
        expect(ORM.Base.ordered).toBeDefined();
      });
    });

    describe('pagination', () => {
      test('method exists', () => {
        expect(ORM.Base.pagination).toBeDefined();
      });
    });

    describe('find', () => {
      test('method exists', () => {
        expect(ORM.Base.find).toBeDefined();
      });
    });

    describe('all', () => {
      test('method exists', () => {
        expect(ORM.Base.all).toBeDefined();
      });
    });

    describe('where', () => {
      test('method exists', () => {
        expect(ORM.Base.where).toBeDefined();
      });
    });

    describe('create', () => {
      test('method exists', () => {
        expect(ORM.Base.create).toBeDefined();
      });
    });
  });
});

describe('Inherited Shot Class', () => {
  test('exsts', () => {
    expect(Shot).toBeDefined();
  });

  describe('Class Methods', () => {
    describe('entityType', () => {
      test('returns the lowercase inherited class name', () => {
        expect(Shot.entityType()).toEqual('shot');
      });
    });

    describe('order', () => {
      describe('array', () => {
        test('returns the order array', () => {
          expect(Shot.order()).toEqual(["2345", "3456", "1234"]);
        });
      });

      describe('immutable', () => {
        test('returns the order immutable', () => {
          expect(Shot.order(true)).toEqual({ entityOrder: Immutable.List(["2345", "3456", "1234"]) });
        });
      });
    });

    describe('ordered', () => {
      let order;
      let ordered;

      beforeEach(() => {
        order = Shot.order();
        ordered = Shot.ordered();
      });

      test('returns an array', () => {
        expect(ordered).toBeInstanceOf(Array);
      });

      test('returns Shot instances', () => {
        expect(ordered[0]).toBeInstanceOf(Shot);
      });

      test('returns ordered shots', () => {
        expect(ordered.map(shot => shot.id)).toEqual(order);
      });
    });

    describe('pagination', () => {
      let pagination;

      beforeEach(() => {
        pagination = Shot.pagination();
      });

      test('returns an object', () => {
        expect(pagination).toBeInstanceOf(Object);
      });

      test('returns the Shot pagination', () => {
        expect(pagination.current_page).toBe(1);
      });
    });

    describe('find', () => {
      describe('found', () => {
        let shot;

        beforeEach(() => {
          shot = Shot.find(1234);
        });

        test('returns a Shot instance', () => {
          expect(shot).toBeInstanceOf(Shot);
        });
      });

      describe('not found', () => {
        test('throws an error', () => {
          expect(() => {
            Shot.find(9999)
          }).toThrow(DatabaseException);
        });
      });
    });

    describe('all', () => {
      let shots;

      beforeEach(() => {
        shots = Shot.all();
      });

      test('returns an array', () => {
        expect(shots).toBeInstanceOf(Array);
      });

      test('array items are Shots', () => {
        expect(shots[0]).toBeInstanceOf(Shot);
      });

      test('returns all the shots, unordered', () => {
        expect(Shot.all().length).toEqual(3);
      });
    });

    describe('where', () => {
      describe('results', () => {
        let results;

        beforeEach(() => {
          results = Shot.where({ projectId: '1' });
        });

        test('returns an array', () => {
          expect(results).toBeInstanceOf(Array);
        });

        test('array containts all results', () => {
          expect(results.length).toBe(2);
        });

        test('array items are Shots', () => {
          expect(results[0]).toBeInstanceOf(Shot);
        });
      });

      describe('no results', () => {
        let results;

        beforeEach(() => {
          results = Shot.where({ projectId: '3' });
        });

        test('returns an array', () => {
          expect(results).toBeInstanceOf(Array);
        });

        test('array is empty', () => {
          expect(results.length).toBe(0);
        });
      });
    });

    describe('create', () => {
      describe('with attributes', () => {
        let shot;

        beforeEach(() => {
          shot = Shot.create({ projectId: 5 });
        });

        test('creates a Shot', () => {
          expect(shot).toBeInstanceOf(Shot);
        });


        test('sets the attribute', () => {
          expect(shot.projectId).toEqual(5);
        });
      });

      describe('without attributes', () => {
        test('creates a Shot', () => {
          const shot = Shot.create();

          expect(shot).toBeInstanceOf(Shot);
        });
      });
    });
  });

  describe('Instance Methods', () => {
    let shot;

    beforeEach(() => {
      shot = Shot.create({ id: 22, projectId: 42 });
    });

    test('default properties', () => {
      expect(shot._changed).toEqual({});
      expect(shot._dirty).toBeFalsy();
      expect(shot._destroyed).toBeFalsy();
    });

    describe('entityType', () => {
      test('returns the lower case classname', () => {
        expect(shot.entityType()).toBe('shot');
      });
    });

    describe('subscription', () => {
      let handleChangesSpy;

      beforeEach(() => {
        handleChangesSpy = spyOn(shot, 'handleChanges');

        store.dispatch(updateShot(shot.id, { character: 'Luigi' }));
      });

      test('calls the handleChanges method', () => {
        expect(handleChangesSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('handleChanges', () => {
      let entityBefore;

      describe('shot unchanged', () => {
        let unchangedShot;

        beforeEach(() => {
          unchangedShot = Shot.create({ id: '4444', projectId: 42 });
          entityBefore = unchangedShot.entity.toMap();

          store.dispatch(updateShot('8888', { character: 'Luigi' }));
        });

        test('entity is unchanged', () => {
          expect(unchangedShot.entity.equals(entityBefore)).toBeTruthy()
        });
      });

      describe('shot changed', () => {
        describe('has local changes', () => {
          beforeEach(() => {
            shot.game = 'Mario Kart';
            entityBefore = shot.entity.toMap();

            store.dispatch(updateShot(shot.id, {
              character: 'Princess Peach',
              game: 'Super Mario Bros.'
            }));
          });

          test('entity is changed', () => {
            expect(shot.entity.equals(entityBefore)).toBeFalsy()
          });

          test('new property is set on entity', () => {
            expect(shot.character).toBe('Princess Peach');
          });

          test('does not overwrite local changes', () => {
            expect(shot.game).toBe('Mario Kart');
          });
        });

        describe('no local changes', () => {
          beforeEach(() => {
            entityBefore = shot.entity.toMap();

            store.dispatch(updateShot(shot.id, { character: 'Luigi' }));
          });

          test('entity is changed', () => {
            expect(shot.entity.equals(entityBefore)).toBeFalsy()
          });

          test('new property is set on entity', () => {
            expect(shot.character).toBe('Luigi');
          });
        });
      });
    });

    describe('valid', () => {
      describe('has project id', () => {
        test('returns true', () => {
          expect(shot.valid()).toBeTruthy();
        });
      });

      describe('no project id', () => {
        test('returns false', () => {
          const projectlessShot = Shot.create();
          expect(projectlessShot.valid()).toBeFalsy();
        });
      });
    });

    describe('changes', () => {
      describe('has changes', () => {
        let changedShot;
        let changes;

        beforeEach(() => {
          changedShot = Shot.create({ projectId: 1, team: 'London Spitfire', wins: 2 });
          changedShot.wins = 3;
          changes = changedShot.changes();
        });

        test('returns an object', () => {
          expect(changes).toBeInstanceOf(Object);
        });

        test('has one change', () => {
          expect(Object.keys(changes).length).toBe(1);
        });

        test('change has new and old value', () => {
          expect(changes['wins'].oldValue).toBe(2);
          expect(changes['wins'].newValue).toBe(3);
        });
      });

      describe('no changes', () => {
        let unchangedShot;
        let changes;

        beforeEach(() => {
          unchangedShot = Shot.create({ projectId: 1, team: 'London Spitfire', wins: 2 });
          changes = unchangedShot.changes();
        });

        test('returns an object', () => {
          expect(changes).toBeInstanceOf(Object);
        });

        test('has no change', () => {
          expect(Object.keys(changes).length).toBe(0);
        });
      });
    });

    describe('save', () => {
      let saveResult;

      describe('valid instance', () => {
        beforeEach(() => {
          onSaveSpy.mockReset();

          shot.channel = 'HBO';
          saveResult = shot.save();
        });

        test('calls the onSave method', () => {
          expect(onSaveSpy).toHaveBeenCalledTimes(1);
          expect(onSaveSpy.mock.calls[0][0]).toBe(shot);
        });

        test('resets the changed info', () => {
          expect(shot._changed).toEqual({})
        });

        test('returns true', () => {
          expect(saveResult).toBeTruthy();
        });
      });

      describe('invalid instance', () => {
        let invalidShot;

        beforeEach(() => {
          invalidShot = Shot.create();
          onSaveSpy.mockReset();

          invalidShot.channel = 'HBO';
          saveResult = invalidShot.save();
        });

        test('does not call the oSave method', () => {
          expect(onSaveSpy).toHaveBeenCalledTimes(0);
        });

        test('does not reset the changed info', () => {
          expect(invalidShot._changed).toEqual({
            channel: {
              oldValue: undefined,
              newValue: 'HBO'
            }
          });
        });

        test('returns false', () => {
          expect(saveResult).toBeFalsy();
        });
      });
    });

    describe('update', () => {
      let updateProps;
      let updateResult;

      describe('valid instance', () => {
        beforeEach(() => {
          onUpdateSpy.mockReset();

          updateProps = { channel: 'HBO '};
          updateResult = shot.update(updateProps);
        });

        test('calls the onUpdate method', () => {
          expect(onUpdateSpy).toHaveBeenCalledTimes(1);
          expect(onUpdateSpy.mock.calls[0][0]).toBe(shot);
          expect(onUpdateSpy.mock.calls[0][1]).toBe(updateProps);
        });

        test('returns true', () => {
          expect(updateResult).toBeTruthy();
        });
      });

      describe('invalid instance', () => {
        let invalidShot;

        beforeEach(() => {
          invalidShot = Shot.create();
          onUpdateSpy.mockReset();

          updateProps = { channel: 'HBO '};
          updateResult = invalidShot.update(updateProps);
        });

        test('does not call the onUpdate method', () => {
          expect(onUpdateSpy).toHaveBeenCalledTimes(0);
        });

        test('returns false', () => {
          expect(updateResult).toBeFalsy();
        });
      });
    });

    describe('destroy', () => {
      let destroyedShot;
      let removeListenerSpy;

      beforeEach(() => {
        onDestroySpy.mockReset();
        destroyedShot = Shot.create({ projectId: 55 });

        removeListenerSpy = spyOn(destroyedShot, 'removeListener');
        destroyedShot.destroy();
      });

      test('sets the destroyed prop to true', () => {
        expect(destroyedShot._destroyed).toBeTruthy();
      });

      test('calls the removeListener method', () => {
        expect(removeListenerSpy).toHaveBeenCalledTimes(1);
      });

      test('calls the onDestroy method', () => {
        expect(onDestroySpy).toHaveBeenCalledTimes(1);
        expect(onDestroySpy.mock.calls[0][0]).toBe(destroyedShot);
      });
    });
  });
});