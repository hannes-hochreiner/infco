export class TaskCouchDbDoc {
  static async run(context, config) {
    let ctxRequ;
    let [ctxConfig, reqConfig] = TaskCouchDbDoc.processConfig(config);

    try {
      ctxRequ = context.createRequest();
      await ctxRequ.open(ctxConfig);

      let {_id, _rev, ...data} = (await ctxRequ.request(reqConfig)).data;
      let newDoc = JSON.parse(config.content);

      if (JSON.stringify(data).localeCompare(JSON.stringify(newDoc)) == 0) {
        return 'ok';
      }
      
      newDoc._id = _id;
      newDoc._rev = _rev;

      reqConfig.method = 'put';
      reqConfig.data = newDoc;
      await ctxRequ.request(reqConfig);

      return 'updated';
    } finally {
      if (typeof ctxRequ !== 'undefined') {
        await ctxRequ.close();
      }
    }
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