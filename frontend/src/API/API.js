import utils from '../utils/utils';


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

function getOperators() {
  return TimeoutPromise(300, (resolve, reject) => {
    if (Math.random() < 0.3) {
      reject(new APIError(ERRORS.UNKNOWN, 'DEBUG ERROR: can not get operators list'));
      return;
    }
    resolve([
      {
        _id: '1',
        name: 'Тройка',
      },
      {
        _id: '2',
        name: 'Умка',
      },
      {
        _id: '3',
        name: 'Червёрка',
      },
      {
        _id: '4',
        name: 'Хрумка',
      },
    ]);
  });
}

let myServices = [
  {
    _id: '1',
    name: 'Проезд',
    description: 'Проезд в городском транспорте г. Рязань',
    isActive: true,
    limits: {
      minBalance: 50,
      maxTransfer: 1500,
    },
    operators: [
      {
        _id: '1',
        startDate: +new Date('1 jan 2005'),
        isActive: true,
      },
    ],
  },
  {
    _id: '2',
    name: 'Кофе',
    description: 'Кофейные автоматы в г. Рязань',
    isActive: false,
    limits: {
      minBalance: 100,
      maxTransfer: 1000,
    },
    operators: [
      {
        _id: '1',
        startDate: +new Date('20 feb 2015'),
        isActive: false,
      },
    ],
  },
];

function getMyServices() {
  return TimeoutPromise(1000, (resolve, reject) => {
    if (Math.random() < 0.3) {
      reject(new APIError(ERRORS.UNKNOWN, 'DEBUG ERROR: can not get my services'));
      return;
    }
    resolve(myServices);
  });
}

function addService({ name, description, limits: { minBalance, maxTransfer } }) {
  return TimeoutPromise(500, (resolve, reject) => {
    if (myServices.find(s => s.name === name)) {
      reject(new APIError(ERRORS.ALREADY_EXISTS, 'service exists'));
      return;
    }
    if (!name || !description || description === '1') {
      reject(new APIError(ERRORS.VALIDATION_FAILS, 'add service validation fails'));
      return;
    }
    myServices = [
      ...myServices,
      {
        _id: `${Math.random()}`,
        name,
        description,
        isActive: true,
        limits: {
          minBalance,
          maxTransfer,
        },
        operators: [],
      },
    ];
    resolve(myServices);
  });
}

function updateMyService(index, newService) {
  myServices = utils.immutableReplaceArrayItem(myServices, index, newService);
}

function setServiceActive(serviceId, isActive) {
  return TimeoutPromise(500, (resolve, reject) => {
    if (Math.random() < 0.7) {
      reject(new APIError(ERRORS.UNKNOWN, 'DEBUG ERROR: can not set service active'));
      return;
    }
    const serviceIndex = utils.findIndexById(myServices, serviceId);
    if (serviceIndex < 0) {
      reject(new APIError(ERRORS.NOT_FOUND, 'service not found'));
      return;
    }
    const service = myServices[serviceIndex];
    const newService = {
      ...service,
      isActive,
    };
    updateMyService(serviceIndex, newService);
    resolve(myServices);
  });
}

function addOperator(serviceId, operatorId) {
  return TimeoutPromise(500, (resolve, reject) => {
    const serviceIndex = utils.findIndexById(myServices, serviceId);
    if (serviceIndex < 0) {
      reject(new APIError(ERRORS.NOT_FOUND, 'service not found'));
      return;
    }
    const service = myServices[serviceIndex];
    const { operators } = service;
    if (operators.find(o => o._id === operatorId)) {
      reject(new APIError(ERRORS.ALREADY_EXISTS, 'operator exists'));
      return;
    }
    const newOperator = {
      _id: operatorId,
      startDate: +new Date(),
      isActive: true,
    };
    const newOperators = [
      ...operators,
      newOperator,
    ];
    const newService = {
      ...service,
      operators: newOperators,
    };
    updateMyService(serviceIndex, newService);
    resolve(myServices);
  });
}

function setOperatorActive(serviceId, operatorId, isActive) {
  return TimeoutPromise(500, (resolve, reject) => {
    const serviceIndex = utils.findIndexById(myServices, serviceId);
    if (serviceIndex < 0) {
      reject(new APIError(ERRORS.NOT_FOUND, 'service not found'));
      return;
    }
    const service = myServices[serviceIndex];
    const { operators } = service;
    const operatorIndex = utils.findIndexById(operators, operatorId);
    if (operatorIndex < 0) {
      reject(new APIError(ERRORS.NOT_FOUND, 'operator not found'));
      return;
    }
    const operator = operators[operatorIndex];
    const newOperator = {
      ...operator,
      isActive,
    };
    const newOperators = utils.immutableReplaceArrayItem(operators, operatorIndex, newOperator);
    const newService = {
      ...service,
      operators: newOperators,
    };
    updateMyService(serviceIndex, newService);
    resolve(myServices);
  });
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
