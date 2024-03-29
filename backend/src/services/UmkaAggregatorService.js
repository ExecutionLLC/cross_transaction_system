const moment = require('moment-timezone');
const oracledb = require('oracledb');
const BaseService = require('./BaseService');
const config = require('../common/Config');

const PROCESSING_NAME = 'УМКА';
const SERVICE_NAME = 'Проезд в общественном транспорте';
const SERVER_TIMEZONE = 'Europe/Moscow';
const DEFAULT_MIN_INS_DATE = moment.tz('2015-01-01T12:00:00.000Z', SERVER_TIMEZONE);

class UmkaAggregatorService extends BaseService {
  constructor(models, services) {
    super(models, services);
    this._config = config.umkaAggregator;

    this._umkaAggregatorModel = this._models.umkaAggregatorModel;

    this._transactionService = this._services.transactionService;
    this._walletService = this._services.walletService;

    this._minInsDate = null;
  }

  _init() {
    return this._umkaAggregatorModel
      .getMinInsDate()
      .then((minInsDate) => {
        if (!minInsDate || minInsDate < DEFAULT_MIN_INS_DATE) {
          this._minInsDate = DEFAULT_MIN_INS_DATE;
        } else {
          this._minInsDate = moment.tz(minInsDate, SERVER_TIMEZONE);
        }
        this._logger.info(`minInsDate loaded (${this._minInsDate})`);

        this._scheduleNext(0);
      });
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

  _scheduleNext(timeout) {
    setTimeout(() => this._getNextBatchOfData(), timeout);
  }

  _promiseErrorHandler(error) {
    const message = (error && error.message) || 'Got unknown error in promise';
    this._logger.error(message);
  }

  _handelDbResults(result) {
    const { rows } = result;
    const { dbBatchSize } = this._config;

    const balancesMap = {};
    const pendedPromises = [];

    let minInsDateChanged = false;

    rows.forEach((r) => {
      const [
        id,
        dateOf,
        insDate,
        kind,
        idCard,
        balance,
        amount,
        amountBail,
        operationSumma,
      ] = r;

      const minInsDate = moment(insDate);
      minInsDate.tz(SERVER_TIMEZONE, true);
      if (minInsDate && this._minInsDate < minInsDate) {
        this._minInsDate = minInsDate;
        minInsDateChanged = true;
      }

      if (!balance || !idCard || !dateOf || !insDate) {
        return;
      }

      const transactionDate = moment(dateOf);
      transactionDate.tz(SERVER_TIMEZONE, true);
      const timestamp = +transactionDate;

      if (balancesMap[idCard] === undefined) {
        balancesMap[idCard] = {
          id: idCard.toString(),
          processingName: PROCESSING_NAME,
          balanceTimestamp: timestamp,
          balance,
        };
      } else if (balancesMap[idCard].balanceTimestamp < timestamp) {
        balancesMap[idCard].balanceTimestamp = timestamp;
        balancesMap[idCard].balance = balance;
      }

      let comment = '';
      let finalAmount = amount || operationSumma;
      if (amount && amountBail) {
        finalAmount -= amountBail;
      }
      if (kind === 7 || kind === 8) {
        comment = 'продажа транспортной карты';
      } else if (kind === 10 || kind === 11) {
        comment = 'Продление/пополнение транспортной карты';
      } else if (kind === 36 || kind === 37 || kind === 38 || kind === 39) {
        comment = 'Отложенное продление/пополнение транспортной карты';
      } else if (kind === 16) {
        comment = 'Оплата проезда';
        finalAmount = -finalAmount;
      } else if (kind === 29) {
        comment = 'Возврат средств';
        finalAmount = -finalAmount;
      } else {
        return;
      }

      const transaction = {
        processingName: PROCESSING_NAME,
        serviceName: SERVICE_NAME,
        operatorName: PROCESSING_NAME,
        walletId: idCard.toString(),
        timestamp,
        amount: finalAmount,
        comment,
        externalTransactionId: id.toString(),
      };

      // in case of error we do not stop processing, we just log it
      const p = this._transactionService
        .add(transaction)
        .catch(error => this._promiseErrorHandler(error));
      pendedPromises.push(p);
    });
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    Object.keys(balancesMap).forEach((k) => {
      const wallet = balancesMap[k];
      const p = this._walletService
        .addOrUpdateWallet(wallet)
        .catch(error => this._promiseErrorHandler(error));
      pendedPromises.push(p);
    }, this);

    if (minInsDateChanged) {
      const p = this._umkaAggregatorModel
        .setMinInsDate(this._minInsDate)
        .catch(error => this._promiseErrorHandler(error));
      pendedPromises.push(p);
      this._logger.info(`minInsDate changed (${this._minInsDate})`);
    }

    return Promise
      .all(pendedPromises)
      .then(() => rows.length === dbBatchSize);
  }

  _getNextBatchOfData() {
    const { dbBatchSize } = this._config;
    const minInsDate = this._minInsDate.format('DD-MM-YYYY, HH:mm:ss');

    return this._getNewConnection()
      .then((connection) => {
        const bindParams = [
          minInsDate,
          dbBatchSize,
        ];

        return Promise.all([connection, connection.execute(
          'select '
          + '  tmp.id, '
          + '  tmp.date_of, '
          + '  tmp.ins_date, '
          + '  tmp.kind, '
          + '  card.num, '
          + '  tmp.ep_balance, '
          + '  tmp.amount, '
          + '  tmp.amount_bail, '
          + '  tmp.operation_summa '
          + 'from ('
          + '  select * '
          + '  from ( '
          + '    select id, date_of, ins_date, kind, id_card, ep_balance, amount, amount_bail, operation_summa '
          + '    from t_data '
          + '    where '
          + '      travel_doc_kind=1 and '
          + '      kind in (7, 8, 10, 11, 16, 29, 32, 36, 37, 38, 39) and '
          + '      ins_date > to_date(:minInsDate, \'dd-mm-yyyy hh24:mi:ss\') '
          + '    order by ins_date '
          + '  ) '
          + '  where '
          + '    rownum <= :dbBatchSize '
          + ') tmp '
          + 'inner join card on card.id=tmp.id_card ',
          bindParams,
        )]);
      })
      .then(([connection, result]) => {
        if (connection) {
          connection.close();
        }
        return this._handelDbResults(result);
      })
      .then((hasNext) => {
        if (hasNext) {
          const { hasNextTimeout } = this._config;
          this._scheduleNext(hasNextTimeout);
        } else {
          const { pollingTimeout } = this._config;
          this._scheduleNext(pollingTimeout);
        }
      })
      .catch((error) => {
        this._logger.error(
          `Got error while aggregate data: ${error.message}`,
        );
        if (error && error.stack) {
          this._logger.debug(`${error.stack}`);
        }

        const { errorTimeout } = this._config;
        this._scheduleNext(errorTimeout);
      });
  }
}

module.exports = UmkaAggregatorService;
