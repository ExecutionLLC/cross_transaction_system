const config = require('./common/Config');
const ControllersFacade = require('./controllers/ControllersFacade');
const LoggersContainer = require('./common/LoggersContainer');
const ModelsFacade = require('./models/ModelsFacade');
const ServicesFacade = require('./services/ServicesFacade');
const WebServer = require('./WebServer');

const logger = LoggersContainer.getLogger('main');
logger.debug(`CONFIG:\n${JSON.stringify(config, null, 2)}`);

const models = new ModelsFacade();
const services = new ServicesFacade(models);
const controllers = new ControllersFacade(services);

models.init()
  .then(() => services.init())
  .then(() => controllers.init())
  .then(() => {
    const webServer = new WebServer(models, services, controllers);
    return webServer.start();
  })
  .catch((error) => {
    logger.error(`FATAL ERROR cannot start server: ${error}`);
    logger.debug(error.stack);
    process.exit(1);
  });
