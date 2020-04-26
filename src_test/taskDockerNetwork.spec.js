import {TaskDockerNetwork} from '../bld/taskDockerNetwork';
import {SequenceSpy} from './sequenceSpy';

describe('TaskDockerNetwork', () => {
  it('can create a network', async () => {
    let tdn = new TaskDockerNetwork(new SequenceSpy([
      {name: 'update', args: ['created network "testNetwork"']}
    ]));

    await tdn.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/networks'}], return: {data: []}},
      {name: 'request', args: [{method: 'post', url: '/networks/create', data: {Name: 'testNetwork'}}], return: {data: {Id: 'id'}}},
      {name: 'close'}
    ])}, {
      "networkName": "testNetwork",
      "actions": ['create']
    });
  });

  it('can recognize that a network exists', async () => {
    let tdn = new TaskDockerNetwork(new SequenceSpy([
      {name: 'info', args: ['network "testNetwork" already exists']}
    ]));

    await tdn.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/networks'}], return: {data: [{Name: 'otherNetwork'}, {Name: 'testNetwork'}]}},
      {name: 'close'}
    ])}, {
      "networkName": "testNetwork",
      "actions": ['create']
    });
  });

  it('can remove a network', async () => {
    let tdn = new TaskDockerNetwork(new SequenceSpy([
      {name: 'update', args: ['deleted network "testNetwork"']}
    ]));

    await tdn.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/networks'}], return: {data: [{Name: 'otherNetwork'}, {Name: 'testNetwork'}]}},
      {name: 'request', args: [{method: 'delete', url: '/networks/testNetwork'}]},
      {name: 'close'}
    ])}, {
      "networkName": "testNetwork",
      "actions": ['remove']
    });
  });

  it('can recognize that a network does not exist', async () => {
    let tdn = new TaskDockerNetwork(new SequenceSpy([
      {name: 'info', args: ['network "testNetwork" does not exist']}
    ]));

    await tdn.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/networks'}], return: {data: [{Name: 'otherNetwork'}]}},
      {name: 'close'}
    ])}, {
      "networkName": "testNetwork",
      "actions": ['remove']
    });
  });

  it('can connect a container to a network', async () => {
    let tdn = new TaskDockerNetwork(new SequenceSpy([
      {name: 'info', args: ['container "cont1" is already connected to network "testNetwork"']},
      {name: 'update', args: ['connected container "cont2" to network "testNetwork"']}
    ]));

    await tdn.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/networks/testNetwork'}], return: {data: {Containers: {id: {Name: 'cont1'}}}}},
      {name: 'request', args: [{method: 'post', url: '/networks/testNetwork/connect', data: {Container: 'cont2'}}]},
      {name: 'close'}
    ])}, {
      "networkName": "testNetwork",
      "actions": ['connect'],
      "containers": ["cont1", "cont2"]
    });
  });

  it('can disconnect a container to a network', async () => {
    let tdn = new TaskDockerNetwork(new SequenceSpy([
      {name: 'update', args: ['disconnected container "cont1" from network "testNetwork"']},
      {name: 'info', args: ['container "cont2" is not connected to network "testNetwork"']}
    ]));

    await tdn.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/networks/testNetwork'}], return: {data: {Containers: {id: {Name: 'cont1'}}}}},
      {name: 'request', args: [{method: 'post', url: '/networks/testNetwork/disconnect', data: {Container: 'cont1'}}]},
      {name: 'close'}
    ])}, {
      "networkName": "testNetwork",
      "actions": ['disconnect'],
      "containers": ["cont1", "cont2"]
    });
  });

  it('can update the list of containers connected to a network', async () => {
    let tdn = new TaskDockerNetwork(new SequenceSpy([
      {name: 'update', args: ['connected container "cont2" to network "testNetwork"']},
      {name: 'update', args: ['disconnected container "cont3" from network "testNetwork"']}
    ]));

    await tdn.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/networks/testNetwork'}], return: {data: {Containers: {id1: {Name: 'cont1'}, id2: {Name: 'cont3'}}}}},
      {name: 'request', args: [{method: 'post', url: '/networks/testNetwork/connect', data: {Container: 'cont2'}}]},
      {name: 'request', args: [{method: 'post', url: '/networks/testNetwork/disconnect', data: {Container: 'cont3'}}]},
      {name: 'close'}
    ])}, {
      "networkName": "testNetwork",
      "actions": ['update'],
      "containers": ["cont1", "cont2"]
    });
  });

  it('can prune unused networks', async () => {
    let tdn = new TaskDockerNetwork(new SequenceSpy([
      {name: 'update', args: ['pruned unused networks']}
    ]));

    await tdn.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'post', url: '/networks/prune'}]},
      {name: 'close'}
    ])}, {
      "actions": ['prune']
    });
  });
});
