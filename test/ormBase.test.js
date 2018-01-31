import Immutable, { Record } from 'immutable';
import ORM from '../src/orm';
import { store, updateShot } from './createStore';

const { spyOn } = jest;

ORM.Config.database = store;

const onCreateSpy = jest.fn();
const onUpdateSpy = jest.fn();
const onDestroySpy = jest.fn();

class Shot extends ORM.Base({
  id: null,
  projectId: null
}) {
  valid() {
    return !!this.projectId;
  }

  onCreate(shot, attributes, dispatch)  {
    onCreateSpy(shot, attributes);
  }

  onUpdate(shot, attributes, dispatch)  {
    onUpdateSpy(shot, attributes);
  }

  onDestroy(shot, dispatch) {
    onDestroySpy(shot);
  }
}

describe('ORMBase', () => {
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
          expect(Shot.database()).toBeInstanceOf(Object);
        });

        test('has a data member', () => {
          expect(Shot.database().data).toBeDefined();
        });

        test('data is the store state', () => {
          expect(Shot.database().data).toEqual(store.getState().data);
        });
      });

      describe('dispatch', () => {
        test('returns a function', () => {
          expect(Shot.dispatch()).toBeInstanceOf(Function);
        });

        test('returns the stores dispatch method', () => {
          expect(Shot.dispatch()).toBe(store.dispatch);
        });
      });

      describe('entityType', () => {
        test('returns lowercase class name', () => {
          expect(Shot.entityType()).toEqual('shot');
        });
      });

      describe('order', () => {
        test('method exists', () => {
          expect(Shot.order).toBeDefined();
        });
      });

      describe('ordered', () => {
        test('method exists', () => {
          expect(Shot.ordered).toBeDefined();
        });
      });

      describe('pagination', () => {
        test('method exists', () => {
          expect(Shot.pagination).toBeDefined();
        });
      });

      describe('findById', () => {
        test('method exists', () => {
          expect(Shot.findById).toBeDefined();
        });
      });

      describe('all', () => {
        test('method exists', () => {
          expect(Shot.all).toBeDefined();
        });
      });

      describe('where', () => {
        test('method exists', () => {
          expect(Shot.where).toBeDefined();
        });
      });

      describe('create', () => {
        test('method exists', () => {
          expect(Shot.create).toBeDefined();
        });
      });
    });
  });

  describe('Inherited Shot Class', () => {
    test('exsts', () => {
      expect(Shot).toBeDefined();
    });

    describe('Class Methods', () => {
      describe('constructor', () => {
        describe('has data', () => {
          let shot;

          describe('hash', () => {
            beforeEach(() => {
              shot = new Shot({ id: '22' });
            });

            test('sets the id', () => {
              expect(shot.id).toBe('22');
            });
          });

          describe('immutable', () => {
            beforeEach(() => {
              shot = new Shot(Immutable.fromJS({ id: '22' }));
            });

            test('sets the id', () => {
              expect(shot.id).toBe('22');
            });
          });
        });

        describe('no data', () => {
          let shot;

          beforeEach(() => {
            shot = new Shot();
          });

          test('returns an instance', () => {
            expect(shot).toBeInstanceOf(Shot);
          });

          test('id is null', () => {
            expect(shot.id).toBeNull();
          });
        });
      });

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
          order = Shot.order(true);
          ordered = Shot.ordered();
        });

        test('returns an Immutable List', () => {
          expect(ordered).toBeInstanceOf(Immutable.List);
        });

        test('returns Shot instances', () => {
          expect(ordered.first()).toBeInstanceOf(Shot);
        });

        test('returns ordered shots', () => {
          expect(ordered.map(shot => shot.id)).toEqual(order.entityOrder);
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
            shot = Shot.findById(1234);
          });

          test('returns a Shot instance', () => {
            expect(shot).toBeInstanceOf(Shot);
          });
        });

        describe('not found', () => {
          test('returns null', () => {
            expect(Shot.findById(9999)).toBeInstanceOf(Shot);
          });
        });
      });

      describe('all', () => {
        let shots;

        beforeEach(() => {
          shots = Shot.all();
        });

        test('returns an Immutable List', () => {
          expect(shots).toBeInstanceOf(Immutable.List);
        });

        test('array items are Shots', () => {
          expect(shots.first()).toBeInstanceOf(Shot);
        });

        test('returns all the shots, unordered', () => {
          expect(shots.count()).toEqual(3);
        });
      });

      describe('where', () => {
        describe('results', () => {
          let results;

          beforeEach(() => {
            results = Shot.where({ projectId: '1' });
          });

          test('returns an Immutable List', () => {
            expect(results).toBeInstanceOf(Immutable.List);
          });

          test('array containts all results', () => {
            expect(results.count()).toBe(2);
          });

          test('array items are Shots', () => {
            expect(results.first()).toBeInstanceOf(Shot);
          });
        });

        describe('no results', () => {
          let results;

          beforeEach(() => {
            results = Shot.where({ projectId: '3' });
          });

          test('returns an Immutable List', () => {
            expect(results).toBeInstanceOf(Immutable.List);
          });

          test('array is empty', () => {
            expect(results.count()).toBe(0);
          });
        });
      });

      describe('create', () => {
        let shot;

        describe('with attributes', () => {
          let attributes;

          beforeEach(() => {
            onCreateSpy.mockReset();

            attributes = { projectId: 5 };
            shot = Shot.create(attributes);
          });

          test('creates a Shot', () => {
            expect(shot).toBeInstanceOf(Shot);
          });

          test('sets the attribute', () => {
            expect(shot.projectId).toEqual(5);
          });

          test('calls the onCreate method', () => {
            expect(onCreateSpy).toHaveBeenCalledTimes(1);
            expect(onCreateSpy.mock.calls[0][0]).toBe(shot);
            expect(onCreateSpy.mock.calls[0][1]).toBe(attributes);
          });
        });

        describe('without attributes', () => {
          beforeEach(() => {
            onCreateSpy.mockReset();

            shot = Shot.create();
          });

          test('creates a Shot', () => {
            expect(shot).toBeInstanceOf(Shot);
          });

          test('calls the onCreate method', () => {
            expect(onCreateSpy).toHaveBeenCalledTimes(1);
            expect(onCreateSpy.mock.calls[0][0]).toBe(shot);
            expect(onCreateSpy.mock.calls[0][1]).toEqual({});
          });
        });
      });
    });

    describe('Instance Methods', () => {
      let shot;

      beforeEach(() => {
        shot = Shot.create({ id: 22, projectId: 42 });
      });

      describe('entityType', () => {
        test('returns the lower case classname', () => {
          expect(shot.entityType()).toBe('shot');
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

      describe('updateProps', () => {
        let updateProps;
        let updateResult;

        describe('valid instance', () => {
          beforeEach(() => {
            onUpdateSpy.mockReset();

            updateProps = { projectId: '123' };
            updateResult = shot.updateProps(updateProps);
          });

          test('calls the onUpdate method', () => {
            expect(onUpdateSpy).toHaveBeenCalledTimes(1);
            expect(onUpdateSpy.mock.calls[0][0]).toBe(shot);
            expect(onUpdateSpy.mock.calls[0][1]).toEqual(updateProps);
          });

          test('returns a different instance', () => {
            expect(updateResult).toBeInstanceOf(Shot);
            expect(updateResult).not.toBe(shot);
            expect(updateResult.projectId).toBe('123');
          });
        });

        describe('invalid instance', () => {
          let invalidShot;

          beforeEach(() => {
            invalidShot = Shot.create();
            onUpdateSpy.mockReset();

            updateProps = { projectId: '3432' };
            updateResult = invalidShot.updateProps(updateProps);
          });

          test('does not call the onUpdate method', () => {
            expect(onUpdateSpy).toHaveBeenCalledTimes(0);
          });

          test('returns the same instance', () => {
            expect(updateResult).toBeInstanceOf(Shot);
            expect(updateResult).toBe(invalidShot);
            expect(updateResult.projectId).toBeNull();
          });
        });
      });

      describe('destroy', () => {
        let destroyedShot;
        let destroyedShotResult;

        beforeEach(() => {
          onDestroySpy.mockReset();
          destroyedShot = Shot.create({ projectId: 55 });

          destroyedShotResult = destroyedShot.destroy();
        });

        // test('sets the destroyed prop to true', () => {
        //   expect(destroyedShot._destroyed).toBeTruthy();
        // });

        test('calls the onDestroy method', () => {
          expect(onDestroySpy).toHaveBeenCalledTimes(1);
          expect(onDestroySpy.mock.calls[0][0]).toBe(destroyedShot);
        });

        test('returns a different instance', () => {
          expect(destroyedShotResult).toBeInstanceOf(Shot);
          expect(destroyedShotResult).not.toBe(destroyedShot);
        });
      });
    });
  });
});
