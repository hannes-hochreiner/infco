export class TaskDockerNetwork {
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
          await this.createNetwork(ctxRequ, config);
        } else if (action == 'remove') {
          await this.removeNetwork(ctxRequ, config);
        } else if (action == 'connect') {
          await this.connectContainers(ctxRequ, config);
        } else if (action == 'disconnect') {
          await this.disconnectContainers(ctxRequ, config);
        } else if (action == 'update') {
          await this.updateNetwork(ctxRequ, config);
        } else if (action == 'prune') {
          await this.pruneNetworks(ctxRequ);
        } else {
          throw new Error(`action "${action}" unknown`);
        }
      }
    } finally {
      if (typeof ctxRequ !== 'undefined') {
        await ctxRequ.close();
      }
    }
  }

  async _listNetworks(ctxRequ) {
    return (await ctxRequ.request({
      method: 'get',
      url: '/networks'
    })).data.map(elem => elem.Name);
  }

  async _getConnectedContainers(ctxRequ, networkName) {
    let network = (await ctxRequ.request({
      method: 'get',
      url: `/networks/${networkName}`
    })).data;

    return Object.getOwnPropertyNames(network.Containers).map(elem => network.Containers[elem].Name);
  }

  async createNetwork(ctxRequ, config) {
    let networkList = await this._listNetworks(ctxRequ);

    if (!networkList.includes(config.networkName)) {
      await ctxRequ.request({
        method: 'post',
        url: '/networks/create',
        data: {
          Name: config.networkName
        }
      });

      this._logger.update(`created network "${config.networkName}"`);
    } else {
      this._logger.info(`network "${config.networkName}" already exists`);
    }
  }

  async pruneNetworks(ctxRequ) {
    await ctxRequ.request({
      method: 'post',
      url: '/networks/prune',
    });
    this._logger.update('pruned unused networks');
  }

  async removeNetwork(ctxRequ, config) {
    let networkList = await this._listNetworks(ctxRequ);

    if (networkList.includes(config.networkName)) {
      await ctxRequ.request({
        method: 'delete',
        url: `/networks/${config.networkName}`,
      });
      this._logger.update(`deleted network "${config.networkName}"`);
    } else {
      this._logger.info(`network "${config.networkName}" does not exist`);
    }
  }

  async _connectContainer(ctxRequ, networkName, containerName) {
    await ctxRequ.request({
      method: 'post',
      url: `/networks/${networkName}/connect`,
      data: {
        Container: containerName
      }
    });
    this._logger.update(`connected container "${containerName}" to network "${networkName}"`);
  }

  async connectContainers(ctxRequ, config) {
    let connectedContainers = await this._getConnectedContainers(ctxRequ, config.networkName);

    for (let cont of config.containers) {
      if (connectedContainers.includes(cont)) {
        this._logger.info(`container "${cont}" is already connected to network "${config.networkName}"`);
      } else {
        await this._connectContainer(ctxRequ, config.networkName, cont);
      }
    }
  }

  async _disconnectContainer(ctxRequ, networkName, containerName) {
    await ctxRequ.request({
      method: 'post',
      url: `/networks/${networkName}/disconnect`,
      data: {
        Container: containerName
      }
    });
    this._logger.update(`disconnected container "${containerName}" from network "${networkName}"`);
  }

  async disconnectContainers(ctxRequ, config) {
    let connectedContainers = await this._getConnectedContainers(ctxRequ, config.networkName);

    for (let cont of config.containers) {
      if (!connectedContainers.includes(cont)) {
        this._logger.info(`container "${cont}" is not connected to network "${config.networkName}"`);
      } else {
        await this._disconnectContainer(ctxRequ, config.networkName, cont);
      }
    }    
  }

  async updateNetwork(ctxRequ, config) {
    let connectedContainers = await this._getConnectedContainers(ctxRequ, config.networkName);
    let containersToAdd = config.containers.filter(elem => !connectedContainers.includes(elem));

    for (let cont of containersToAdd) {
      await this._connectContainer(ctxRequ, config.networkName, cont);
    }

    let containersToRemove = connectedContainers.filter(elem => !config.containers.includes(elem));

    for (let cont of containersToRemove) {
      await this._disconnectContainer(ctxRequ, config.networkName, cont);
    }
  }
}
