export class TaskCouchDbDoc {
  constructor(logger) {
    this._logger = logger;
  }

  async run(context, config) {
    let ctxRequ;
    let ctxConfig = {
      protocol: config.protocol || 'http',
      host: config.host,
      port: config.port,
      socketPath: config.socketPath
    }

    if (typeof ctxConfig.host === 'undefined' && typeof ctxConfig.port === 'undefined' && typeof ctxConfig.socketPath === 'undefined') {
      ctxConfig.host = '127.0.0.1';
      ctxConfig.port = 5984;
    }

    try {
      ctxRequ = context.createRequest();
      await ctxRequ.open(ctxConfig);

      let reqConfig = {
        method: 'get',
        url: config.url,
        auth: config.auth
      };

      let id, rev, data;

      try {
        let oldDoc = (await ctxRequ.request(reqConfig)).data;

        id = oldDoc._id;
        rev = oldDoc._rev;
        data = JSON.parse(JSON.stringify(oldDoc));
        delete data._id;
        delete data._rev;
      } catch (error) {
        if (typeof error.response === 'undefined' || error.response.status != 404) {
          throw error;
        }
      }

      let newDoc = JSON.parse(config.content);
  
      if (typeof data != 'undefined' && JSON.stringify(data).localeCompare(JSON.stringify(newDoc)) == 0) {
        this._logger.info(`document at "${config.url}" is up to date`);
        return;
      }

      newDoc._id = id;
      newDoc._rev = rev;

      reqConfig.method = 'put';
      reqConfig.data = newDoc;

      await ctxRequ.request(reqConfig);

      this._logger.update(`document at "${config.url}" was updated`);
    } finally {
      if (typeof ctxRequ !== 'undefined') {
        await ctxRequ.close();
      }
    }
  }
}
