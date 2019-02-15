import ORM from '../src/orm';

export const onCreateSpy = jest.fn().mockReturnValue('finish create');
export const onUpdateSpy = jest.fn().mockReturnValue('finish update');
export const onDestroySpy = jest.fn().mockReturnValue('finish destroy');

export class Shot extends ORM.Base({
  id: null,
  projectId: null
}, 'shot') {
  valid() {
    return !!this.projectId;
  }

  onCreate(shot, attributes, dispatch) { // eslint-disable-line class-methods-use-this
    return onCreateSpy(shot, attributes);
  }

  onUpdate(shot, attributes, dispatch) { // eslint-disable-line class-methods-use-this
    return onUpdateSpy(shot, attributes);
  }

  onDestroy(shot, dispatch) { // eslint-disable-line class-methods-use-this
    return onDestroySpy(shot);
  }
}

export class Project extends ORM.Base({ id: null }, 'project') {}
