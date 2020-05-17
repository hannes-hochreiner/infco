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

    try {
      ctxRequ = context.createRequest();

      if (typeof ctxConfig.socketPath == 'undefined' &&
        typeof ctxConfig.port == 'undefined' &&
        typeof ctxConfig.socketPath == 'undefined' &&
        typeof config.dockerContainer != 'undefined' &&
        typeof config.dockerNetwork != 'undefined') {
        await ctxRequ.open({protocol: 'http', socketPath: '/var/run/docker.sock'});
        ctxConfig.host = (await ctxRequ.request({
          method: 'get',
          url: `/containers/${config.dockerContainer}/json`,
        })).data.NetworkSettings.Networks[config.dockerNetwork].IPAddress;
        await ctxRequ.close();
      }
      
      if (typeof ctxConfig.socketPath == 'undefined') {
        ctxConfig.host = ctxConfig.host || '127.0.0.1';
        ctxConfig.port = ctxConfig.port || 5984;
      }
      
      config.urlPrefix = config.urlPrefix || '';

      await ctxRequ.open(ctxConfig);

      let dbList = (await ctxRequ.request({
        method: 'get',
        url: `${config.urlPrefix}/_all_dbs`,
        auth: config.auth
      })).data;

      for (let dbName of [config.name, '_users']) {
        if (!dbList.includes(dbName)) {
          await ctxRequ.request({
            method: 'put',
            url: `${config.urlPrefix}/${dbName}`,
            auth: config.auth
          });
          this._logger.update(`created database "${dbName}"`);
        } else {
          this._logger.info(`database "${dbName}" already exists`);
        }
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
