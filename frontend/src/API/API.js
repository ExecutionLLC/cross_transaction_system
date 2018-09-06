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
  //return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiZDUxMGNlNzEtY2U5NS00NTZkLWI1YjUtNGQwZjljYzY5ZmJiIiwidHlwZSI6IlBST0NFU1NJTkciLCJuYW1lIjoi0JrQvtGE0LXQvNCw0L0ifQ.Ec3JzmSGaeBkps4uolaOpxgslvyhpL6iiT8QRsFNlW8';
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
    .then(getTransactionAndMyServices);
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
    .then(getTransactionAndMyServices);
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
    .then(getTransactionAndMyServices);
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
    .then(getTransactionAndMyServices);
}

function setExternalServiceState(operatorId, serviceId, isActive) {
  return Promise.resolve()
    .then(getAuthName)
    .then(authName => (
      request.put(
        `${getBaseUrl()}processing/${authName}/externalServices/${operatorId}/${serviceId}`,
        {
          headers: { ...getAuthHeader() },
          body: {
            isActive,
          },
          json: true,
        },
      )
    ))
    .then(getTransactionAndExternalServices);
}

function getCards(cardNumber) {
  return TimeoutPromise(2000, (resolve, reject) => {
    if (cardNumber.length < 3) {
      reject(new APIError(ERRORS.UNKNOWN, 'Card search error'));
      return;
    }
    console.log('eededd', cardNumber.split());
    resolve(
      cardNumber.split('').slice(0, cardNumber.length - 3).map(
        ch => ({
          date: +new Date(),
          operation: `op-${ch.toUpperCase()}`,
          serviceId: `service-${ch.toUpperCase()}`,
          contragent: `contragent-${ch.toUpperCase()}`,
          amount: ch.charCodeAt(0),
          isActive: ch.charCodeAt(0) % 2,
        }),
      ),
    );
  });
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
  getCards,
  ERRORS,
};
