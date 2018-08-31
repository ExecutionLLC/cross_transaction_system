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
};


function TimeoutPromise(time, f) {
  return new Promise((resolve, reject) => {
    setTimeout(
      f.bind(f, resolve, reject),
      time,
    );
  });
}


function getProfile() {
  return TimeoutPromise(500, (resolve, reject) => {
    if (Math.random() < 0.5) {
      reject(new APIError(ERRORS.UNKNOWN, 'can not get profile info'));
      return;
    }
    resolve({
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


export default {
  getProfile,
  ERRORS,
};
