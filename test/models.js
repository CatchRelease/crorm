import ORM from '../src/orm';

export const onCreateSpy = jest.fn().mockReturnValue('finish create');

export class Shot extends ORM.Base({
  id: null,
  projectId: null
}, 'shot') {
  onCreate(...args) { // eslint-disable-line class-methods-use-this
    return onCreateSpy(...args);
  }
}

export class Project extends ORM.Base({ id: null }, 'project') {}
