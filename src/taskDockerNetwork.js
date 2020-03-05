export class TaskDockerNetwork {
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

      let networkList = (await ctxRequ.request({
        method: 'get',
        url: '/networks'
      })).data;

      let network = networkList.find(elem => elem.Name === config.networkName);

      if (typeof network === 'undefined') {
        await ctxRequ.request({
          method: 'post',
          url: '/networks/create',
          data: {
            Name: config.networkName
          }
        });
        returnString = 'updated';
      }

      network = (await ctxRequ.request({
        method: 'get',
        url: `/networks/${config.networkName}`
      })).data;

      let containersAdded = Object.getOwnPropertyNames(network.Containers).map(elem => network.Containers[elem].Name);
      let containersToAdd = config.containers.filter(elem => !containersAdded.includes(elem));

      for (let contIdx in containersToAdd) {
        await ctxRequ.request({
          method: 'post',
          url: `/networks/${config.networkName}/connect`,
          data: {
            Container: containersToAdd[contIdx]
          }
        });
        returnString = 'updated';
      }

      let containersToRemove = containersAdded.filter(elem => !config.containers.includes(elem));

      for (let contIdx in containersToRemove) {
        await ctxRequ.request({
          method: 'post',
          url: `/networks/${config.networkName}/disconnect`,
          data: {
            Container: containersToRemove[contIdx]
          }
        });
        returnString = 'updated';
      }

      return returnString;
    } finally {
      if (typeof ctxRequ !== 'undefined') {
        await ctxRequ.close();
      }
    }
  }
}
