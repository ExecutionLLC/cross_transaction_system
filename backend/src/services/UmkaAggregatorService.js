const oracledb = require('oracledb');
const BaseService = require('./BaseService');
const config = require('../common/Config');

class UmkaAggregatorService extends BaseService {
  constructor(models, services) {
    super(models, services);
    this._config = config.umkaAggregator;
  }

  _getNewConnection() {
    const {
      dbConnectionString: connectString,
      dbUser: user,
      dbPassword: password,
    } = this._config;

    return oracledb
      .getConnection({
        connectString,
        user,
        password,
      });
  }

  _getNextBatchOfData(connection) {
  }
}

module.exports = UmkaAggregatorService;
