export class TaskCouchDb {
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

      let dbList = (await ctxRequ.request({
        method: 'get',
        url: `${config.urlPrefix}/_all_dbs`,
        auth: config.auth
      })).data;

      if (!dbList.includes(config.name)) {
        await ctxRequ.request({
          method: 'put',
          url: `${config.urlPrefix}/${config.name}`,
          auth: config.auth
        });
        this._logger.update(`created database "${config.name}"`);
      } else {
        this._logger.info(`database "${config.name}" already exists`);
      }

      let securityDoc = (await ctxRequ.request({
        method: 'get',
        url: `${config.urlPrefix}/${config.name}/_security`,
        auth: config.auth
      })).data;

      if (JSON.stringify(securityDoc).localeCompare(JSON.stringify(config.security)) != 0) {
        await ctxRequ.request({
          method: 'put',
          url: `${config.urlPrefix}/${config.name}/_security`,
          auth: config.auth,
          data: config.security
        });
        this._logger.update(`updated security configuration for database "${config.name}"`);
      } else {
        this._logger.info(`security configuration for database "${config.name}" is up to date`);
      }
    } finally {
      if (typeof ctxRequ !== 'undefined') {
        await ctxRequ.close();
      }
    }
  }
}
