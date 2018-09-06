import request from 'request-promise';


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

function getBaseUrl() {
  return 'http://192.168.1.101:3001/';
}

function getAccessToken() {
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiZDZiN2U3YjgtN2VmOS00NDcwLWE4NGUtYzIyMzc0ZmEyOTQxIiwidHlwZSI6IlBST0NFU1NJTkciLCJuYW1lIjoi0KPQnNCa0JAifQ.TAj78PFZ1qBmbTOQ6qLQKRNI3bjwqz23VAvK1SgQKvA';
}

function getAuthHeader() {
  return {
    'X-Access-Token': getAccessToken(),
  };
}

function getAuthName() {
  return request.get(
    `${getBaseUrl()}auth/`,
    {
      headers: {
        ...getAuthHeader(),
      },
      json: true,
    },
  )
    .then(res => res.name);
}

function getProcessing() {
  return getAuthName()
    .then(name => (
      request.get(
        `${getBaseUrl()}processing/${name}`,
        {
          headers: {
            ...getAuthHeader(),
          },
          json: true,
        },
      )
    ));
}

function translateAPIOperators(apiOperators) {
  return apiOperators.map(operator => ({
    _id: operator.processingName,
    name: operator.processingName,
    startDate: +new Date('1 jan 2005'),
    isActive: operator.isActive,
  }));
}

function getMyServices() {
  return getProcessing()
    .then(processing => (
      processing.services
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
        .sort((s1, s2) => s1.name > s2.name)
    ));
}

function getOperators() {
  return getAuthName()
    .then(name => (
      request.get(
        `${getBaseUrl()}processing/${name}/operatorsList`,
        {
          headers: {
            ...getAuthHeader(),
          },
          json: true,
        },
      )
    ))
    .then(operators => operators.map(operator => ({
      ...operator,
      _id: operator.name,
    })));
}


function getTransactionAndServices(result) {
  const { transactionId } = result;
  return getMyServices()
    .then(services => ({
      services,
      transactionId,
    }));
}

function addService({ name, description, limits: { minBalance, maxTransfer } }) {
  return Promise.resolve()
    .then(getAuthName)
    .then(authName => (
      request.post(
        `${getBaseUrl()}processing/${authName}/services`,
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
    ))
    .then(getTransactionAndServices);
}

function addOperator(serviceId, operatorId) {
  return Promise.resolve()
    .then(getAuthName)
    .then(authName => (
      request.post(
        `${getBaseUrl()}processing/${authName}/services/${serviceId}/operators`,
        {
          headers: { ...getAuthHeader() },
          body: {
            parentProcessingName: operatorId,
            isActive: true,
          },
          json: true,
        },
      )
    ))
    .then(getTransactionAndServices);
}

function setServiceActive(serviceId, isActive) {
  return Promise.resolve()
    .then(getAuthName)
    .then(authName => (
      request.put(
        `${getBaseUrl()}processing/${authName}/services/${serviceId}`,
        {
          headers: { ...getAuthHeader() },
          body: {
            isActive,
          },
          json: true,
        },
      )
    ))
    .then(getTransactionAndServices);
}

function setOperatorActive(serviceId, operatorId, isActive) {
  return Promise.resolve()
    .then(getAuthName)
    .then(authName => (
      request.put(
        `${getBaseUrl()}processing/${authName}/services/${serviceId}/operators/${operatorId}`,
        {
          headers: { ...getAuthHeader() },
          body: {
            isActive,
          },
          json: true,
        },
      )
    ))
    .then(getTransactionAndServices);
}


export default {
  getProfile,
  getOperators,
  getMyServices,
  addService,
  setServiceActive,
  addOperator,
  setOperatorActive,
  ERRORS,
};
