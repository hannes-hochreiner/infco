export class TaskDockerImage {
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
        if (action == 'prune') {
          await this.pruneImages(ctxRequ);
        } else if (action == 'create') {
          await this.createImages(ctxRequ, config);
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

  async _listImages(ctxRequ) {
    return (await ctxRequ.request({
      method: 'get',
      url: '/images/json'
    })).data.map(elem => elem.RepoTags).flat(Infinity);
  }

  async createImages(ctxRequ, config) {
    let availableImages = await this._listImages(ctxRequ);

    for (let image of config.images) {
      if (availableImages.includes(image)) {
        this._logger.info(`image "${image}" exists`);
      } else {
        await ctxRequ.request({
          method: 'post',
          url: '/images/create',
          params: {fromImage: image}
        });
        this._logger.update(`created image "${image}"`);
      }
    }
  }

  async pruneImages(ctxRequ) {
    let count = (await ctxRequ.request({
      method: 'post',
      url: '/images/prune'
    })).data.ImagesDeleted.length;
    let plural = 's';
    
    if (count == 1) {
      plural = '';
    }

    this._logger.update(`pruned ${count} image${plural}`);
  }
}
