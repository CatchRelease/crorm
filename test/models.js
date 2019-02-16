import ORM from '../src/orm';

export const onCreateSpy = jest.fn().mockReturnValue('finish create');

export class Shot extends ORM.Base({
  id: null,
  projectId: null
}, 'shot') {
  onCreate(dispatch, attributes) { // eslint-disable-line class-methods-use-this
    return onCreateSpy(dispatch, attributes);
  }
}

export class Project extends ORM.Base({ id: null }, 'project') {}
