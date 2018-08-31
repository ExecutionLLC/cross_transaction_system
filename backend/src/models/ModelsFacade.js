const mongoose = require('mongoose');
const URL = require('url');
const AsyncInitializedObject = require('../common/AsyncInitializedObject');
const BaseModel = require('./BaseModel');
const config = require('../common/Config');
const UserModel = require('./UserModel');
const Utils = require('../common/Utils');

class ModelsFacade extends AsyncInitializedObject {
  constructor() {
    super();

    this._db = mongoose.createConnection();

    this.userModel = new UserModel(this._db);
  }

  _init() {
    const modelsInitPromises = this.getAllModels().map(model => model.init());
    return this._initDb().then(() => Promise.all(modelsInitPromises));
  }

  getAllModels() {
    return Utils.collectInstancesOf(this, BaseModel);
  }

  _initDb() {
    const {
      host,
      port,
      user,
      password: pass,
      database,
    } = config.get('mongodb');

    const uri = URL.format({
      protocol: 'mongodb',
      hostname: host,
      port,
      pathname: database,
      slashes: true,
    });
    return this._db.openUri(uri, { useNewUrlParser: true, user, pass });
  }
}

module.exports = ModelsFacade;
