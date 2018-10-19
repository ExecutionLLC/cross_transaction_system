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
    port: 3001,
    useTokens: true,
    tokensSecret: 'cts',
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
  services: {
    useUmkaAggregator: true,
  },
  hyperledger: {
    storePath: './runtime/hfc-key-store',
    channelName: 'public',
    chaincodeId: 'cross-transaction-system',
    ordererUrl: 'grpc://localhost:7050',
    peerUrl: 'grpc://localhost:7051',
    username: 'user1',
  },
  umkaAggregator: {
    dbConnectionString: '192.168.10.4:1521/MAGICASH',
    dbUser: 'Cptt',
    dbPassword: '1',
    dbBatchSize: 500,
    errorTimeout: 5 * 60 * 1000, // 5 mins
    hasNextTimeout: 0, // immediately
    pollingTimeout: 15 * 60 * 1000, // 15 mins
  },
});

module.exports = store.get();
