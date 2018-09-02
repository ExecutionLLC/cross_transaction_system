const changeCase = require('change-case');
const fs = require('fs');
const nconf = require('nconf');
const path = require('path');

const store = new nconf.Provider();

const FILE_CONFIG_PATH = path.resolve(`${__dirname}/../../config.json`);
const ENV_VARIABLES_PREFIX = 'CTS_';

// remove prefix and transform sub keys case to camel case
function transformEnvVariable(keyValueObj) {
  const { key, value } = keyValueObj;
  const minKeyLength = ENV_VARIABLES_PREFIX.length + 1;
  if (!key || !key.startsWith(ENV_VARIABLES_PREFIX) || key.length < minKeyLength) {
    return false;
  }

  const trimmedKey = key.slice(ENV_VARIABLES_PREFIX.length);
  const normalizedKey = trimmedKey.split('__').map(keyPart => changeCase.camelCase(keyPart)).join('__');

  return {
    key: normalizedKey,
    value,
  };
}

// sources priority:
// 1. env
// 2. file
// 3. default values
store.env({
  transform: transformEnvVariable,
  separator: '__',
  parseValues: true,
});

if (fs.existsSync(FILE_CONFIG_PATH)) {
  // eslint-disable-next-line no-console
  console.log(`found config file (path = "${FILE_CONFIG_PATH}")`);
  store.file({
    file: FILE_CONFIG_PATH,
  });
}

store.defaults({
  webserver: {
    port: '6000',
  },
  logging: {
    console: {
      loglevel: 'debug',
    },
    file: {
      path: 'runtime/logs/app.log',
      loglevel: 'debug',
    },
  },
  mongodb: {
    host: 'localhost',
    port: '27017',
    user: 'cts',
    password: 'cts',
    database: 'cts',
  },
  hyperledger: {
    storePath: './runtime/hfc-key-store',
    channelName: 'cts',
    chaincodeId: 'cts',
    ordererUrl: 'grpc://localhost:7050',
    peerUrl: 'grpc://localhost:7051',
    eventhubUrl: 'grpc://localhost:7053',
    username: 'user1',
  },
});

module.exports = store.get();
