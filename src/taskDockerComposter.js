export class TaskDockerComposter {
  constructor(logger, Composter, Docker) {
    this._logger = logger;
    this._Composter = Composter;
    this._Docker = Docker;
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
      const composter = new this._Composter(new this._Docker(ctxRequ, this._logger), this._logger);

      for (let action of config.actions) {
        if (action == 'up') {
          await composter.up(config.data);
        } else if (action == 'down') {
          await composter.down(config.data);
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
}
