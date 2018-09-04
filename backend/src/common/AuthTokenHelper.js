const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');

const ADMIN_USER_TYPE = 'ADMIN';
const PROCESSING_USER_TYPE = 'PROCESSING';

class AuthTokenHelper {
  static isUserType(userType) {
    return userType === ADMIN_USER_TYPE || userType === PROCESSING_USER_TYPE;
  }

  static _generateAuthToken(tokenData, secretPhrase) {
    return new Promise((resolve, reject) => {
      jwt.sign(tokenData, secretPhrase, { noTimestamp: true }, (err, signedToken) => {
        if (err) {
          reject(err);
        } else {
          resolve(signedToken);
        }
      });
    });
  }

  static generateAdminAuthToken(secretPhrase) {
    const tokenData = {
      uuid: uuidv4(),
      type: ADMIN_USER_TYPE,
    };

    return AuthTokenHelper._generateAuthToken(tokenData, secretPhrase);
  }

  static generateProcessingAuthToken(processingName, secretPhrase) {
    const tokenData = {
      uuid: uuidv4(),
      type: PROCESSING_USER_TYPE,
      name: processingName,
    };

    return AuthTokenHelper._generateAuthToken(tokenData, secretPhrase);
  }

  static decodeAndVerifyAuthToken(token, secretPhrase) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secretPhrase, (err, decodedToken) => {
        if (err) {
          reject(err);
        } else if (!AuthTokenHelper.isUserType(decodedToken.userType)) {
          reject(new Error('Got unknown user type'));
        } else {
          resolve(decodedToken);
        }
      });
    });
  }

  static getUserTypeByToken(token, secretPhrase) {
    return AuthTokenHelper
      .decodeAndVerifyAuthToken(token, secretPhrase)
      .then(decodedToken => decodedToken.userType);
  }

  static isAdminToken(token, secretPhrase) {
    return AuthTokenHelper
      .getUserTypeByToken(token, secretPhrase)
      .then(apiUserType => apiUserType === ADMIN_USER_TYPE);
  }

  static isProcessingToken(token, secretPhrase) {
    return AuthTokenHelper
      .getUserTypeByToken(token, secretPhrase)
      .then(userType => userType === PROCESSING_USER_TYPE);
  }
}
module.exports = {
  ADMIN_USER_TYPE,
  PROCESSING_USER_TYPE,
  AuthTokenHelper,
};
