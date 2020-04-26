export class TaskDockerContainer {
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
          await this.createContainer(ctxRequ, config);
        } else if (action == 'start') {
          await this.startContainer(ctxRequ, config);
        } else if (action == 'stop') {
          await this.stopContainer(ctxRequ, config);
        } else if (action == 'wait') {
          await this.waitForContainer(ctxRequ, config);
        } else if (action == 'remove') {
          await this.removeContainer(ctxRequ, config);
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

  async getInfo(ctxRequ, config) {
    let containerList = (await ctxRequ.request({
      method: 'get',
      url: '/containers/json',
      params: {
        all: true
      }
    })).data;

    return containerList.find(elem => elem.Names.includes(`/${config.name}`));
  }

  async createContainer(ctxRequ, config) {
    let cInfo = await this.getInfo(ctxRequ, config);

    if (typeof cInfo !== 'undefined') {
      this._logger.info(`container "${config.name}" already exists`);
      return;
    }

    await ctxRequ.request({
      method: 'post',
      url: '/containers/create',
      params: {
        name: config.name
      },
      data: config.data
    });

    this._logger.update(`container "${config.name}" was created`);
  }

  async startContainer(ctxRequ, config) {
    let cInfo = await this.getInfo(ctxRequ, config);

    if (typeof cInfo == 'undefined') {
      throw new Error(`container "${config.name}" does not exist`);
    }

    if (cInfo.State == 'running') {
      await ctxRequ.request({
        method: 'post',
        url: `/containers/${config.name}/restart`
      });
      this._logger.update(`container "${config.name}" was restarted`);
    } else {
      await ctxRequ.request({
        method: 'post',
        url: `/containers/${config.name}/start`
      });
      this._logger.update(`container "${config.name}" was started`);
    }
  }

  async stopContainer(ctxRequ, config) {
    let cInfo = await this.getInfo(ctxRequ, config);

    if (typeof cInfo == 'undefined') {
      throw new Error(`container "${config.name}" does not exist`);
    }

    if (cInfo.State == 'running') {
      await ctxRequ.request({
        method: 'post',
        url: `/containers/${config.name}/stop`
      });
      this._logger.update(`container "${config.name}" was stopped`);
    } else {
      this._logger.info(`container "${config.name}" is not running`);
    }
  }

  async waitForContainer(ctxRequ, config) {
    let cInfo = await this.getInfo(ctxRequ, config);

    if (typeof cInfo == 'undefined') {
      throw new Error(`container "${config.name}" does not exist`);
    }

    if (cInfo.State == 'running') {
      let res = await ctxRequ.request({
        method: 'post',
        url: `/containers/${config.name}/wait`
      });
      this._logger.update(`container "${config.name}" stopped`);

      if (res.data.Error) {
        throw new Error(res.data.Error);
      }
    } else {
      this._logger.info(`container "${config.name}" is not running`);
    }    
  }

  async removeContainer(ctxRequ, config) {
    let cInfo = await this.getInfo(ctxRequ, config);

    if (typeof cInfo == 'undefined') {
      this._logger.info(`container "${config.name}" does not exist`);
      return;
    }

    await ctxRequ.request({
      method: 'delete',
      url: `/containers/${config.name}`
    });
    this._logger.update(`container "${config.name}" was deleted`);
  }
}
