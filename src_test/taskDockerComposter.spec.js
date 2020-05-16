import {TaskDockerComposter} from '../bld/taskDockerComposter';
import {SequenceSpy} from './sequenceSpy';

describe('TaskDockerComposter', () => {
  it('can create containers, networks, and volumes', async () => {
    let tdc = new TaskDockerComposter({}, ComposterUpMock, DockerMock);

    await tdc.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'close'}
    ])}, {
      "name": "test",
      "data": "data",
      "actions": ['up']
    });
  });

  it('can remove containers, networks, and volumes', async () => {
    let tdc = new TaskDockerComposter({}, ComposterDownMock, DockerMock);

    await tdc.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'close'}
    ])}, {
      "name": "test",
      "data": "data",
      "actions": ['down']
    });
  });
});

class ComposterUpMock {
  constructor(docker, logger) {
    expect(docker).not.toBeUndefined();;
    expect(logger).not.toBeUndefined();
  }

  up(config) {
    expect(config).toEqual('data');
  }
}

class ComposterDownMock {
  constructor(docker, logger) {
    expect(docker).not.toBeUndefined();;
    expect(logger).not.toBeUndefined();
  }

  down(config) {
    expect(config).toEqual('data');
  }
}

class DockerMock {
  constructor(request, logger) {
    expect(request).not.toBeUndefined();
    expect(logger).not.toBeUndefined();
  }
}