export class TaskDockerContainer {
  static async run(context, config) {
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

    let returnString = 'ok';

    try {
      ctxRequ = context.createRequest();
      await ctxRequ.open(ctxConfig);

      let containerList = (await ctxRequ.request({
        method: 'get',
        url: '/containers/json',
        params: {
          all: true
        }
      })).data;

      let container = containerList.find(elem => elem.Names.includes(`/${config.containerName}`));

      if (typeof container === 'undefined') {
        await this.createContainer(ctxRequ, config);
        returnString = 'updated';
      }

      container = (await ctxRequ.request({
        method: 'get',
        url: `/containers/${config.containerName}/json`
      })).data;

      if (container.State.Status !== 'running') {
        await this.startContainer(ctxRequ, config);
        returnString = 'updated';
      }

      return returnString;
    } finally {
      if (typeof ctxRequ !== 'undefined') {
        await ctxRequ.close();
      }
    }
  }

  static async createContainer(ctxRequ, config) {
    let reqConfig = {};

    reqConfig.method = 'post';
    reqConfig.url = '/containers/create';
    reqConfig.params = {
      name: config.containerName
    };
    reqConfig.data = {
      Image: config.image,
      Env: Object.getOwnPropertyNames(config.env).map(elem => `${elem}=${config.env[elem]}`),
      HostConfig: {
        Binds: config.volumes,
        RestartPolicy: {
          Name: "on-failure",
          MaximumRetryCount: 10
        }
      }
    };
   
    await ctxRequ.request(reqConfig);
  }

  static async startContainer(ctxRequ, config) {
    let reqConfig = {};

    reqConfig.method = 'post';
    reqConfig.url = `/containers/${config.containerName}/start`;

    await ctxRequ.request(reqConfig);
  }
}
