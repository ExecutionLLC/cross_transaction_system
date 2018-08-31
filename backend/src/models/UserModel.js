const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

class UserModel extends BaseModel {
  constructor(db) {
    super(db);
    this._mongoModel = null;
  }

  _init() {
    return new Promise((resolve) => {
      const schema = new mongoose.Schema({
        username: {
          type: String,
          required: true,
          index: true,
          unique: true,
        },
        password: {
          type: String,
          required: true,
        },
      });
      this._mongoModel = this._db.model('User', schema);

      resolve();
    });
  }

  get(username) {
    return this._mongoModel.findOne({ username }).exec();
  }

  add(username, password) {
    return this._mongoModel.create({ username, password });
  }

  remove(username) {
    return this._mongoModel.deleteOne({ username });
  }

  update(username, password) {
    return this._mongoModel.update({ username }, { password });
  }
}

module.exports = UserModel;
