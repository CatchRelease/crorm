import Immutable from 'immutable';

import ORM from '../src/orm';
import { store } from './createStore';
import { Shot, Project, onCreateSpy } from './models';

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
      test('exists', () => {
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

    describe('Instance Methods', () => {
      describe('valid', () => {
        test('always returns true', () => {
          const record = new Base();

          expect(record.valid()).toBeTruthy();
        });
      });

      describe('updateProps', () => {
        const props = { foo: '123' };
        const record = new Base();
        const mockOnUpdateResult = 'update result';
        let onUpdateSpy;

        beforeEach(() => {
          onUpdateSpy = jest.spyOn(record, 'onUpdate').mockReturnValue(mockOnUpdateResult);
        });

        afterEach(() => {
          onUpdateSpy.mockRestore();
        });

        describe('valid instance', () => {
          test('calls the onUpdate method', () => {
            record.updateProps(props);

            expect(onUpdateSpy).toHaveBeenCalledTimes(1);
            expect(onUpdateSpy).toHaveBeenCalledWith(Base.dispatch(), props);
          });

          test('returns whatever the onUpdate method returns', () => {
            expect(record.updateProps(props)).toEqual(mockOnUpdateResult);
          });
        });

        describe('invalid instance', () => {
          let validSpy;

          beforeEach(() => {
            validSpy = jest.spyOn(record, 'valid').mockReturnValue(false);
          });

          afterEach(() => {
            validSpy.mockRestore();
          });

          test('returns a rejected promise', () => {
            expect(record.updateProps(props)).rejects.toThrow('record invalid!');
          });

          test('does not call the onUpdate method', () => {
            record.updateProps(props).catch(() => null);
            expect(onUpdateSpy).toHaveBeenCalledTimes(0);
          });
        });
      });

      describe('destroy', () => {
        const record = new Base();
        const mockOnDestroyResult = 'destroy result';
        let onDestroySpy;

        beforeEach(() => {
          onDestroySpy = jest.spyOn(record, 'onDestroy').mockReturnValue(mockOnDestroyResult);
        });

        afterEach(() => {
          onDestroySpy.mockRestore();
        });

        // test('sets the destroyed prop to true', () => {
        //   expect(record._destroyed).toBeTruthy();
        // });

        test('calls the onDestroy method', () => {
          record.destroy();

          expect(onDestroySpy).toHaveBeenCalledTimes(1);
        });

        test('returns whatever the onDestroy method returns', () => {
          expect(record.destroy()).toEqual(mockOnDestroyResult);
        });
      });

      describe('onCreate', () => {
        test('returns the record', () => {
          const record = new Base();

          return expect(record.onCreate()).resolves.toBe(record);
        });
      });

      describe('onUpdate', () => {
        test('returns the updated record', () => {
          class Custom extends ORM.Base({ id: '' }, 'custom') {}

          const record = new Custom();

          return expect(record.onUpdate(null, { id: 12 }))
            .resolves.toEqual(record.merge({ id: 12 }));
        });
      });

      describe('onDestroy', () => {
        test('returns the updated record', () => {
          const record = new Base();

          return expect(record.onDestroy()).resolves.toBe(record.clear());
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
        describe('default order key', () => {
          test('returns the order immutable', () => {
            expect(Shot.order()).toEqual(Immutable.List(['2345', '3456']));
          });
        });

        describe('custom order key', () => {
          test('returns the order immutable', () => {
            expect(Shot.order({ key: 'collection_shot' })).toEqual(Immutable.List(['3456', '1234']));
          });
        });
      });

      describe('ordered', () => {
        let ordered;

        describe('default behavior', () => {
          beforeEach(() => {
            ordered = Shot.ordered();
          });

          test('returns an Immutable List', () => {
            expect(ordered).toBeInstanceOf(Immutable.List);
          });

          test('returns Shot instances', () => {
            expect(ordered.first()).toBeInstanceOf(Shot);
          });

          test('returns ordered shots', () => {
            expect(ordered.map(shot => shot.id)).toEqual(Immutable.List(['2345', '3456']));
          });
        });

        describe('with order key', () => {
          beforeEach(() => {
            ordered = Shot.ordered({ key: 'collection_shot' });
          });

          test('returns an Immutable List', () => {
            expect(ordered).toBeInstanceOf(Immutable.List);
          });

          test('returns Shot instances', () => {
            expect(ordered.first()).toBeInstanceOf(Shot);
          });

          test('returns ordered shots', () => {
            expect(ordered.map(shot => shot.id)).toEqual(Immutable.List(['3456', '1234']));
          });
        });

        describe('with filter', () => {
          let order;

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
              expect(Shot.ordered()).toBe(ordered);
            });
          });

          describe('entity scoped', () => {
            test('returns the memoized result', () => {
              // calling all on a different entity should not invalidate the cache
              Project.ordered();

              expect(Shot.ordered()).toBe(ordered);
            });
          });

          describe('predicate changes', () => {
            test('returns different result', () => {
              expect(Shot.ordered({ predicate: '1' })).not.toBe(ordered);
            });
          });
        });
      });

      describe('pagination', () => {
        let pagination;

        describe('default behavior', () => {
          beforeEach(() => {
            pagination = Shot.pagination();
          });

          test('returns the pagination', () => {
            expect(pagination).toEqual(Immutable.fromJS({
              previous_page: null,
              next_page: 2,
              current_page: 1,
              total_pages: 3,
              total_count: 111,
              count: 50
            }));
          });
        });

        describe('with order key', () => {
          beforeEach(() => {
            pagination = Shot.pagination({ key: 'collection_shot' });
          });

          test('returns the pagination', () => {
            expect(pagination).toEqual(Immutable.fromJS({
              previous_page: null,
              next_page: 2,
              current_page: 1,
              total_pages: 5,
              total_count: 10,
              count: 2
            }));
          });
        });

        describe('memoization', () => {
          beforeEach(() => {
            pagination = Shot.pagination();
          });

          describe('basic', () => {
            test('returns the memoized result', () => {
              expect(Shot.pagination()).toBe(pagination);
            });
          });

          describe('entity scoped', () => {
            test('returns the memoized result', () => {
              Project.pagination();

              expect(Shot.pagination()).toBe(pagination);
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
              expect(Shot.findById(1234)).toBe(shot);
            });
          });

          describe('entity scoped', () => {
            test('returns the memoized result', () => {
              // calling the method on a different entity should not invalidate the cache
              Project.findById(1234);

              expect(Shot.findById(1234)).toBe(shot);
            });
          });

          describe('predicate changes', () => {
            test('returns different result', () => {
              const newShot = Shot.findById(2345);

              expect(newShot).not.toBe(shot);
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
              expect(Shot.all()).toBe(shots);
            });
          });

          describe('entity scoped', () => {
            test('returns the memoized result', () => {
              // calling the method on a different entity should not invalidate the cache
              Project.all();

              expect(Shot.all()).toBe(shots);
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
              expect(Shot.where(predicate)).toBe(results);
            });
          });

          describe('entity scoped', () => {
            test('returns the memoized result', () => {
              // calling the method on a different entity should not invalidate the cache
              Project.where(predicate);

              expect(Shot.where(predicate)).toBe(results);
            });
          });
        });
      });

      describe('create', () => {
        describe('with attributes', () => {
          const attributes = { projectId: 5 };

          beforeEach(() => {
            onCreateSpy.mockClear();
          });

          test('returns whatever the onCreate handler returns', () => {
            expect(Shot.create(attributes)).toEqual('finish create');
          });

          test('calls the onCreate method', () => {
            Shot.create(attributes);

            expect(onCreateSpy).toHaveBeenCalledTimes(1);
            expect(onCreateSpy).toHaveBeenCalledWith(Base.dispatch(), attributes);
          });

          test('passes any additional arguments alon to onCreate', () => {
            const reducerParams = { orderKey: 'myKey' };
            Shot.create(attributes, reducerParams);

            expect(onCreateSpy).toHaveBeenCalledWith(Base.dispatch(), attributes, reducerParams);
          });
        });

        describe('without attributes', () => {
          beforeEach(() => {
            onCreateSpy.mockClear();
          });

          test('returns whatever the onCreate handler returns', () => {
            expect(Shot.create()).toEqual('finish create');
          });

          test('calls the onCreate method', () => {
            Shot.create();

            expect(onCreateSpy).toHaveBeenCalledTimes(1);
            expect(onCreateSpy).toHaveBeenCalledWith(Base.dispatch(), {});
          });
        });
      });
    });
  });
});
