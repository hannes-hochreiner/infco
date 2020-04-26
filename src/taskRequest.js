export class TaskRequest {
  constructor(logger) {
    this._logger = logger;
  }

  async run(context, config) {
    let ctxRequ;
    let [ctxConfig, reqConfig] = this.processConfig(config);

    try {
      ctxRequ = context.createRequest();

      await ctxRequ.open(ctxConfig);
      await ctxRequ.request(reqConfig);
      this._logger.update('request was executed');
    } finally {
      if (typeof ctxRequ !== 'undefined') {
        await ctxRequ.close();
      }
    }
  }

  processConfig(config) {
    let ctxPropNames = ['protocol', 'host', 'port', 'socketPath'];
    let ctxConfig = {};
    let reqConfig = {};

    Object.getOwnPropertyNames(config).forEach(propName => {
      if (ctxPropNames.includes(propName)) {
        ctxConfig[propName] = config[propName];
      } else {
        reqConfig[propName] = config[propName];
      }
    });

    return [ctxConfig, reqConfig];
  }
}