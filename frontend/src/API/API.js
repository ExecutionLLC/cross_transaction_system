import request from 'request-promise';
import config from '../config';
import {
  getAuthHeader,
  getUserName,
} from './auth_header';


class APIError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.message = message;
  }
}


const ERRORS = {
  UNKNOWN: 'UNKNOWN',
  USER_EXISTS: 'USER_EXISTS',
  WRONG_PASSWORD: 'WRONG_PASSWORD',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  VALIDATION_FAILS: 'VALIDATION_FAILS',
  NOT_FOUND: 'NOT_FOUND',
};


function TimeoutPromise(time, f) {
  return new Promise((resolve, reject) => {
    setTimeout(
      f.bind(f, resolve, reject),
      time,
    );
  });
}

function getBaseUrl() {
  return config.API_BASE_URL;
}

function getProfile(date) {
  return TimeoutPromise(500, (resolve, reject) => {
    if (Math.random() < 0.5) {
      reject(new APIError(ERRORS.UNKNOWN, 'DEBUG ERROR: can not get profile info'));
      return;
    }
    resolve({
      _id: '4',
      dateRange: [new Date('01/01/2017'), new Date()],
      ownServicesOwnCards: {
        count: 10,
        amount: 1000,
      },
      ownServicesOtherCards: {
        count: 20,
        amount: 2000,
      },
      otherServicesOwnCards: {
        count: 50,
        amount: 5000,
      },
    });
  });
}

function getProcessing() {
  return request.get(
    `${getBaseUrl()}processing/${getUserName()}`,
    {
      headers: {
        ...getAuthHeader(),
      },
      json: true,
    },
  );
}

function translateAPIOperators(apiOperators) {
  return apiOperators.map(operator => ({
    _id: operator.processingName,
    name: operator.processingName,
    startDate: +new Date('1 jan 2005'),
    isActive: operator.isActive,
    externalServiceIsActive: operator.externalServiceIsActive,
  }));
}

function translateMyServices(apiServices) {
  return apiServices
    .map(
      service => ({
        _id: service.serviceName,
        name: service.serviceName,
        description: service.description,
        limits: {
          minBalance: service.minBalanceLimit,
          maxTransfer: service.maxPerDayLimit,
        },
        isActive: service.isActive,
        operators: translateAPIOperators(service.operators || []),
      }),
    )
    .sort((s1, s2) => s1.name > s2.name);
}

function translateExternalServices(apiServices) {
  return apiServices
    .map(
      service => ({
        _id: JSON.stringify([service.serviceProcessingName, service.serviceName]),
        processingName: service.serviceProcessingName,
        processingDescription: service.serviceDescription,
        name: service.serviceName,
        serviceLimits: {
          minBalance: service.serviceMinBalanceLimit,
          maxTransfer: service.serviceMaxPerDayLimit,
        },
        processingIsAllowed: service.serviceIsActive,
        serviceIsActive: service.isActive,
      }),
    )
    .sort((s1, s2) => `${s1.processingName}${s1.name}` > `${s2.processingName}${s2.name}`);
}

function getMyServices() {
  return getProcessing()
    .then(processing => translateMyServices(processing.services));
}

function getExternalServices() {
  return getProcessing()
    .then(processing => translateExternalServices(processing.externalServices));
}

function getOperators() {
  return request.get(
    `${getBaseUrl()}processing/${getUserName()}/operatorsList`,
    {
      headers: {
        ...getAuthHeader(),
      },
      json: true,
    },
  )
    .then(operators => operators.map(operator => ({
      ...operator,
      _id: operator.name,
    })));
}


function getTransactionAndMyServices(result) {
  const { transactionId } = result;
  return getMyServices()
    .then(services => ({
      services,
      transactionId,
    }));
}

function getTransactionAndExternalServices(result) {
  const { transactionId } = result;
  return getExternalServices()
    .then(services => ({
      services,
      transactionId,
    }));
}

function addService({ name, description, limits: { minBalance, maxTransfer } }) {
  return request.post(
    `${getBaseUrl()}processing/${getUserName()}/services`,
    {
      headers: { ...getAuthHeader() },
      body: {
        name,
        description,
        minBalanceLimit: minBalance,
        maxPerDayLimit: maxTransfer,
        isActive: true,
      },
      json: true,
    },
  )
    .then(getTransactionAndMyServices);
}

function addOperator(serviceId, operatorId) {
  return request.post(
    `${getBaseUrl()}processing/${getUserName()}/services/${serviceId}/operators`,
    {
      headers: { ...getAuthHeader() },
      body: {
        parentProcessingName: operatorId,
        isActive: true,
      },
      json: true,
    },
  )
    .then(getTransactionAndMyServices);
}

function setServiceActive(serviceId, isActive) {
  return request.put(
    `${getBaseUrl()}processing/${getUserName()}/services/${serviceId}`,
    {
      headers: { ...getAuthHeader() },
      body: {
        isActive,
      },
      json: true,
    },
  )
    .then(getTransactionAndMyServices);
}

function setOperatorActive(serviceId, operatorId, isActive) {
  return request.put(
    `${getBaseUrl()}processing/${getUserName()}/services/${serviceId}/operators/${operatorId}`,
    {
      headers: { ...getAuthHeader() },
      body: {
        isActive,
      },
      json: true,
    },
  )
    .then(getTransactionAndMyServices);
}

function setExternalServiceState(operatorId, serviceId, isActive) {
  return request.put(
    `${getBaseUrl()}processing/${getUserName()}/externalServices/${operatorId}/${serviceId}`,
    {
      headers: { ...getAuthHeader() },
      body: {
        isActive,
      },
      json: true,
    },
  )
    .then(getTransactionAndExternalServices);
}

function getWallet(cardNumber, offset, limit) {
  return request.get(
    `${getBaseUrl()}wallet/${getUserName()}/${cardNumber}`,
    {
      qs: { limit, offset },
      headers: { ...getAuthHeader() },
      json: true,
    },
  );
}


export default {
  getProfile,
  getOperators,
  getMyServices,
  getExternalServices,
  addService,
  setServiceActive,
  addOperator,
  setOperatorActive,
  setExternalServiceState,
  getWallet,
  ERRORS,
};
