export class ORMConfig {
  constructor() {
    this._database = null;
  }

  get database() {
    return this._database;
  }

  set database(database) {
    this._database = database;
  }
}

export default ORMConfig;
