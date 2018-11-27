import ORM from '../src/orm';

export const onCreateSpy = jest.fn();
export const onUpdateSpy = jest.fn();
export const onDestroySpy = jest.fn();

export class Shot extends ORM.Base({
  id: null,
  projectId: null
}, 'shot') {
  valid() {
    return !!this.projectId;
  }

  onCreate(shot, attributes, dispatch) { // eslint-disable-line class-methods-use-this
    onCreateSpy(shot, attributes);
  }

  onUpdate(shot, attributes, dispatch) { // eslint-disable-line class-methods-use-this
    onUpdateSpy(shot, attributes);
  }

  onDestroy(shot, dispatch) { // eslint-disable-line class-methods-use-this
    onDestroySpy(shot);
  }
}

export class Project extends ORM.Base({ id: null }, 'project') {}
