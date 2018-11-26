import Immutable from 'immutable';

import ORM from '../src/orm';
import { store } from './createStore';
import { Shot, Project, onCreateSpy, onDestroySpy, onUpdateSpy } from './models';

ORM.Config.database = store;
ORM.Config.debug = false;

const Base = ORM.Base({});

describe('ORMBase', () => {
  const classMethods = ['order', 'ordered', 'pagination', 'findById', 'all', 'where', 'create'];

  describe('Setup', () => {
    test('store is setup', () => {
      expect(store).toBeDefined();
    });
  });

  describe('Base Class', () => {
    describe('valid', () => {
      test('exsts', () => {
        expect(ORM.Base).toBeDefined();
      });
    });

    describe('invalid', () => {
      test('throws error', () => {
        expect(() => {
          class Bad extends ORM.Base({ // eslint-disable-line no-unused-vars
            id: null,
            recordType: null
          }) {}
        }).toThrow(/redefine/);
      });
    });

    describe('Class Methods', () => {
      describe('database', () => {
        test('returns an object', () => {
          expect(Base.database()).toBeInstanceOf(Object);
        });

        test('has a data member', () => {
          expect(Base.database().data).toBeDefined();
        });

        test('data is the store state', () => {
          expect(Base.database().data).toEqual(store.getState().data);
        });
      });

      describe('dispatch', () => {
        test('returns a function', () => {
          expect(Base.dispatch()).toBeInstanceOf(Function);
        });

        test('returns the stores dispatch method', () => {
          expect(Base.dispatch()).toBe(store.dispatch);
        });
      });

      classMethods.forEach(method => {
        describe(method, () => {
          test('method exists', () => {
            expect(Base[method]).toBeInstanceOf(Function);
          });
        });
      });
    });
  });

  describe('Inherited Shot Class', () => {
    test('exists', () => {
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

      describe('recordType', () => {
        test('returns the lowercase inherited class name', () => {
          expect(Shot.recordType()).toEqual('shot');
        });
      });

      describe('order', () => {
        test('returns the order immutable', () => {
          expect(Shot.order(true)).toEqual(Immutable.List(['2345', '3456', '1234']));
        });
      });

      describe('ordered', () => {
        let order;
        let ordered;

        describe('without filter', () => {
          beforeEach(() => {
            order = Shot.order();
            ordered = Shot.ordered();
          });

          test('returns an Immutable List', () => {
            expect(ordered).toBeInstanceOf(Immutable.List);
          });

          test('returns Shot instances', () => {
            expect(ordered.first()).toBeInstanceOf(Shot);
          });

          test('returns ordered shots', () => {
            expect(ordered.map(shot => shot.id)).toEqual(Immutable.List(['2345', '3456', '1234']));
          });
        });

        describe('with filter', () => {
          beforeEach(() => {
            order = Shot.order();
            ordered = Shot.ordered({ projectId: '1' });
          });

          test('returns an Immutable List', () => {
            expect(ordered).toBeInstanceOf(Immutable.List);
          });

          test('returns Shot instances that match the filter', () => {
            ordered.forEach((item) => {
              expect(item).toBeInstanceOf(Shot);
              expect(item.projectId).toEqual('1');
            });
          });

          test('returns ordered shots', () => {
            const ids = ordered.map(shot => shot.id);
            const includedEntities = order.filter((id) => ids.includes(id));

            expect(ids).toEqual(includedEntities);
          });
        });

        describe('memoization', () => {
          beforeEach(() => {
            ordered = Shot.ordered();
          });

          describe('basic', () => {
            test('returns the memoized result', () => {
              expect(Shot.ordered()).toEqual(ordered);
            });
          });

          describe('entity scoped', () => {
            test('returns the memoized result', () => {
              // calling all on a different entity should not invalidate the cache
              Project.ordered();

              expect(Shot.ordered()).toEqual(ordered);
            });
          });

          describe('predicate changes', () => {
            test('returns different result', () => {
              expect(Shot.ordered({ predicate: '1' })).not.toEqual(ordered);
            });
          });
        });
      });

      describe('pagination', () => {
        let pagination;

        beforeEach(() => {
          pagination = Shot.pagination();
        });

        describe('results', () => {
          test('returns an object', () => {
            expect(pagination).toBeInstanceOf(Object);
          });

          test('returns the Shot pagination', () => {
            expect(pagination.toJS().current_page).toBe(1);
          });
        });

        describe('memoization', () => {
          describe('basic', () => {
            test('returns the memoized result', () => {
              expect(Shot.pagination()).toEqual(pagination);
            });
          });

          describe('entity scoped', () => {
            test('returns the memoized result', () => {
              Project.pagination();

              expect(Shot.pagination()).toEqual(pagination);
            });
          });
        });
      });

      describe('find', () => {
        describe('results', () => {
          describe('entity found', () => {
            let shot;

            beforeEach(() => {
              shot = Shot.findById(1234);
            });

            test('returns a Shot instance', () => {
              expect(shot).toBeInstanceOf(Shot);
            });
          });

          describe('entity not found', () => {
            test('returns null', () => {
              expect(Shot.findById(9999)).toBeNull();
            });
          });
        });

        describe('memoization', () => {
          let shot;

          beforeEach(() => {
            shot = Shot.findById(1234);
          });

          describe('basic', () => {
            test('returns the memoized result', () => {
              expect(Shot.findById(1234)).toEqual(shot);
            });
          });

          describe('entity scoped', () => {
            test('returns the memoized result', () => {
              // calling the method on a different entity should not invalidate the cache
              Project.findById(1234);

              expect(Shot.findById(1234)).toEqual(shot);
            });
          });

          describe('predicate changes', () => {
            test('returns different result', () => {
              const newShot = Shot.findById(2345);

              expect(newShot).not.toEqual(shot);
              expect(newShot).toBeInstanceOf(Shot);
            });
          });
        });
      });

      describe('all', () => {
        let shots;

        beforeEach(() => {
          shots = Shot.all();
        });

        describe('results', () => {
          test('returns an Immutable Map', () => {
            expect(shots).toBeInstanceOf(Immutable.Map);
          });

          test('array items are Shots', () => {
            expect(shots.first()).toBeInstanceOf(Shot);
          });

          test('returns all the shots, unordered', () => {
            expect(shots.count()).toEqual(3);
          });
        });

        describe('memoization', () => {
          describe('basic', () => {
            test('returns the memoized result', () => {
              expect(Shot.all()).toEqual(shots);
            });
          });

          describe('entity scoped', () => {
            test('returns the memoized result', () => {
              // calling the method on a different entity should not invalidate the cache
              Project.all();

              expect(Shot.all()).toEqual(shots);
            });
          });
        });
      });

      describe('where', () => {
        let results;

        describe('results', () => {
          describe('has results', () => {
            describe('single match value', () => {
              beforeEach(() => {
                results = Shot.where({ projectId: '1' });
              });

              test('returns an Immutable List', () => {
                expect(results).toBeInstanceOf(Immutable.List);
              });

              test('array contains all results', () => {
                expect(results.count()).toBe(2);
                expect(results.every((result) => result.projectId === '1')).toBe(true);
              });

              test('array items are Shots', () => {
                expect(results.first()).toBeInstanceOf(Shot);
              });
            });

            describe('array of matchable values', () => {
              beforeEach(() => {
                results = Shot.where({ projectId: ['1', '2'] });
              });

              test('returns an Immutable List', () => {
                expect(results).toBeInstanceOf(Immutable.List);
              });

              test('array contains all results', () => {
                expect(results.count()).toBe(3);
                expect(results.every((result) => ['1', '2'].includes(result.projectId))).toBe(true);
              });

              test('array items are Shots', () => {
                expect(results.first()).toBeInstanceOf(Shot);
              });
            });
          });

          describe('no results', () => {
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

        describe('memoization', () => {
          const predicate = { projectId: '1' };

          beforeEach(() => {
            results = Shot.where(predicate);
          });

          describe('basic', () => {
            test('returns the memoized result', () => {
              expect(Shot.where(predicate)).toEqual(results);
            });
          });

          describe('entity scoped', () => {
            test('returns the memoized result', () => {
              // calling the method on a different entity should not invalidate the cache
              Project.where(predicate);

              expect(Shot.where(predicate)).toEqual(results);
            });
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
