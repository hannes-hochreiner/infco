export class TaskRequest {
  static async run(context, config) {
    let ctxRequ;
    let [ctxConfig, reqConfig] = TaskRequest.processConfig(config);

    try {
      ctxRequ = context.createRequest();
      await ctxRequ.open(ctxConfig);
      console.log(await ctxRequ.request(reqConfig));
    } finally {
      if (typeof ctxRequ !== 'undefined') {
        await ctxRequ.close();
      }
    }

    return 'executed';
  }

  static processConfig(config) {
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