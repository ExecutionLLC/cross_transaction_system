const changeCase = require('change-case');
const fs = require('fs');
const nconf = require('nconf');
const path = require('path');

const FILE_CONFIG_PATH = path.resolve(`${__dirname}/../../config.json`);
const ENV_VARIABLES_PREFIX = 'CSL_';

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
nconf.env({
  transform: transformEnvVariable,
  separator: '__',
  parseValues: true,
});

if (fs.existsSync(FILE_CONFIG_PATH)) {
  // eslint-disable-next-line no-console
  console.log(`found config file (path = "${FILE_CONFIG_PATH}")`);
  nconf.file({
    file: FILE_CONFIG_PATH,
  });
}

nconf.defaults({
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
    user: 'csl',
    password: 'csl',
    database: 'csl',
  },
});

module.exports = nconf;
