export class TaskDockerVolume {
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
    };

    if (typeof ctxConfig.host === 'undefined' && typeof ctxConfig.port === 'undefined' && typeof ctxConfig.socketPath === 'undefined') {
      ctxConfig.socketPath = '/var/run/docker.sock';
    }

    try {
      ctxRequ = context.createRequest();
      await ctxRequ.open(ctxConfig);

      for (let action of config.actions) {
        if (action == 'create') {
          await this.createVolume(ctxRequ, config);
        } else if (action == 'remove') {
          await this.removeVolume(ctxRequ, config);
        } else {
          throw new Error(`unknown action "${action}"`);
        }
      }
    } finally {
      if (typeof ctxRequ !== 'undefined') {
        await ctxRequ.close();
      }
    }
  }

  async _listVolumes(ctxRequ) {
    return (await ctxRequ.request({
      method: 'get',
      url: '/volumes'
    })).data.Volumes.map(elem => elem.Name);
  }

  async createVolume(ctxRequ, config) {
    let existingVolumes = await this._listVolumes(ctxRequ);

    if (existingVolumes.includes(config.volumeName)) {
      this._logger.info(`volume "${config.volumeName}" exists`);
    } else {
      await ctxRequ.request({
        method: 'post',
        url: '/volumes/create',
        data: {Name: config.volumeName}
      });
  
      this._logger.update(`created volume "${config.volumeName}"`);
    }
  }

  async removeVolume(ctxRequ, config) {
    let existingVolumes = await this._listVolumes(ctxRequ);

    if (!existingVolumes.includes(config.volumeName)) {
      this._logger.info(`volume "${config.volumeName}" does not exist`);
    } else {
      await ctxRequ.request({
        method: 'delete',
        url: `/volumes/${config.volumeName}`
      });
  
      this._logger.update(`removed volume "${config.volumeName}"`);
    }
  }
}
