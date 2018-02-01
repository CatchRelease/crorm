export class ORMConfig {
  constructor() {
    this._database = null;
    this._debug = false;
  }

  get database() {
    return this._database;
  }

  set database(database) {
    this._database = database;
  }

  get debug() {
    return this._debug;
  }

  set debug(debug) {
    this._debug = debug;
  }
}

export default ORMConfig;
