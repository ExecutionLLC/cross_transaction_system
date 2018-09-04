const { PROCESSING_USER_TYPE, AuthTokenHelper } = require('../src/common/AuthTokenHelper');

const { argv } = process;

function printUsage() {
  console.log('node generate-token.js {USER_TYPE} {SECRET_PHRASE} [PROCESSING_NAME]');
}

if (argv.length !== 4 && argv.length !== 5) {
  console.error('argv.length !== 4 && argv.length !== 5');
  printUsage();
} else {
  const userType = argv[2];
  const secretPhrase = argv[3];
  if (userType === PROCESSING_USER_TYPE) {
    if (argv.length !== 5) {
      console.error('userType === PROCESSING_USER_TYPE, but argv.length !== 5');
    }
    const processingName = argv[4];
    AuthTokenHelper
      .generateProcessingAuthToken(processingName, secretPhrase)
      .then(console.log)
      .catch(console.error);
  } else {
    AuthTokenHelper
      .generateAdminAuthToken(secretPhrase)
      .then(console.log)
      .catch(console.error);
  }
}
