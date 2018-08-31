const BaseService = require('./BaseService');
const ConflictError = require('../common/errors/ConflictError');
const NotFoundError = require('../common/errors/NotFoundError');

class UserService extends BaseService {
  constructor(models) {
    super(models);
    this._userModel = this._models.userModel;
  }

  get(username) {
    return this._userModel.get(username).then((user) => {
      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    });
  }

  add(username, password) {
    return this._userModel.get(username).then((user) => {
      if (user) {
        throw new ConflictError('User already exists');
      }

      return this._userModel.add(username, password);
    });
  }

  remove(username) {
    // we call user.get because we should be sure in item existence
    return this.get(username).then(() => this._userModel.remove(username));
  }

  update(username, password) {
    // we call user.get because we should be sure in item existence
    return this.get(username).then(() => this._userModel.update(username, password));
  }
}

module.exports = UserService;
