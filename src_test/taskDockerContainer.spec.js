import {TaskDockerContainer} from '../bld/taskDockerContainer';
import {SequenceSpy} from './sequenceSpy';

describe('TaskDockerContainer', () => {
  it('can create a container', async () => {
    let tdc = new TaskDockerContainer(new SequenceSpy([
      {name: 'update', args: ['container "test" was created']}
    ]));

    await tdc.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/containers/json', params: {all: true}}], return: {data: [{Names: ['/asbc']}]}},
      {name: 'request', args: [{method: 'post', url: '/containers/create', params: {name: 'test'}, data: 'data'}], return: {data: {Id: 'id'}}},
      {name: 'close'}
    ])}, {
      "name": "test",
      "data": "data",
      "actions": ['create']
    });
  });

  it('can notice that a container already exists', async () => {
    let tdc = new TaskDockerContainer(new SequenceSpy([
      {name: 'info', args: ['container "test" already exists']}
    ]));

    await tdc.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/containers/json', params: {all: true}}], return: {data: [{Names: ['/test']}]}},
      {name: 'close'}
    ])}, {
      "name": "test",
      "data": "data",
      "actions": ['create']
    });
  });

  it('can restart a container', async () => {
    let tdc = new TaskDockerContainer(new SequenceSpy([
      {name: 'update', args: ['container "test" was restarted']}
    ]));

    await tdc.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/containers/json', params: {all: true}}], return: {data: [{Names: ['/asbc']}, {Names: ['/test'], State: 'running'}]}},
      {name: 'request', args: [{method: 'post', url: '/containers/test/restart'}]},
      {name: 'close'}
    ])}, {
      "name": "test",
      "actions": ['start']
    });
  });

  it('can start a container', async () => {
    let tdc = new TaskDockerContainer(new SequenceSpy([
      {name: 'update', args: ['container "test" was started']}
    ]));

    await tdc.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/containers/json', params: {all: true}}], return: {data: [{Names: '/asbc'}, {Names: '/test', State: 'stopped'}]}},
      {name: 'request', args: [{method: 'post', url: '/containers/test/start'}]},
      {name: 'close'}
    ])}, {
      "name": "test",
      "actions": ['start']
    });
  });

  it('can notice that a container does not exist', async () => {
    let tdc = new TaskDockerContainer();

    await expectAsync(tdc.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/containers/json', params: {all: true}}], return: {data: [{Names: ['/asbc']}, {Names: ['/tests'], State: 'stopped'}]}},
      {name: 'close'}
    ])}, {
      "name": "test",
      "actions": ['start']
    })).toBeRejectedWithError('container "test" does not exist');
  });

  it('can stop a container', async () => {
    let tdc = new TaskDockerContainer(new SequenceSpy([
      {name: 'update', args: ['container "test" was stopped']}
    ]));

    await tdc.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/containers/json', params: {all: true}}], return: {data: [{Names: ['/asbc']}, {Names: ['/test'], State: 'running'}]}},
      {name: 'request', args: [{method: 'post', url: '/containers/test/stop'}]},
      {name: 'close'}
    ])}, {
      "name": "test",
      "actions": ['stop']
    });
  });

  it('can notice that a container is not running', async () => {
    let tdc = new TaskDockerContainer(new SequenceSpy([
      {name: 'info', args: ['container "test" is not running']}
    ]));

    await tdc.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/containers/json', params: {all: true}}], return: {data: [{Names: ['/asbc']}, {Names: ['/test'], State: 'stopped'}]}},
      {name: 'close'}
    ])}, {
      "name": "test",
      "actions": ['stop']
    });
  });

  it('can wait for a container', async () => {
    let tdc = new TaskDockerContainer(new SequenceSpy([
      {name: 'update', args: ['container "test" stopped']}
    ]));

    await tdc.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/containers/json', params: {all: true}}], return: {data: [{Names: ['/asbc']}, {Names: ['/test'], State: 'running'}]}},
      {name: 'request', args: [{method: 'post', url: '/containers/test/wait'}], return: {data: {StatusCode: 0}}},
      {name: 'close'}
    ])}, {
      "name": "test",
      "actions": ['wait']
    });
  });

  it('can delete a container', async () => {
    let tdc = new TaskDockerContainer(new SequenceSpy([
      {name: 'update', args: ['container "test" was deleted']}
    ]));

    await tdc.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/containers/json', params: {all: true}}], return: {data: [{Names: ['/asbc']}, {Names: ['/test'], State: 'running'}]}},
      {name: 'request', args: [{method: 'delete', url: '/containers/test'}]},
      {name: 'close'}
    ])}, {
      "name": "test",
      "actions": ['remove']
    });
  });
});
