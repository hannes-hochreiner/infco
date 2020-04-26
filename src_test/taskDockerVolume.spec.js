import {TaskDockerVolume} from '../bld/taskDockerVolume';
import {SequenceSpy} from './sequenceSpy';

describe('TaskDockerVolume', () => {
  it('can create a volume', async () => {
    let tdv = new TaskDockerVolume(new SequenceSpy([
      {name: 'update', args: ['created volume "vol1"']}
    ]));

    await tdv.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/volumes'}], return: {data:{Volumes: [{Name: 'vol2'}]}}},
      {name: 'request', args: [{method: 'post', url: '/volumes/create', data: {Name: 'vol1'}}]},
      {name: 'close'}
    ])}, {
      "volumeName": "vol1",
      "actions": ['create']
    });
  });

  it('can recognize that a volume exists', async () => {
    let tdv = new TaskDockerVolume(new SequenceSpy([
      {name: 'info', args: ['volume "vol1" exists']}
    ]));

    await tdv.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/volumes'}], return: {data:{Volumes: [{Name: 'vol1'}]}}},
      {name: 'close'}
    ])}, {
      "volumeName": "vol1",
      "actions": ['create']
    });
  });

  it('can remove a volume', async () => {
    let tdv = new TaskDockerVolume(new SequenceSpy([
      {name: 'update', args: ['removed volume "vol1"']}
    ]));

    await tdv.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/volumes'}], return: {data:{Volumes: [{Name: 'vol1'}]}}},
      {name: 'request', args: [{method: 'delete', url: '/volumes/vol1'}]},
      {name: 'close'}
    ])}, {
      "volumeName": "vol1",
      "actions": ['remove']
    });
  });

  it('can recognize that a volume does not exist', async () => {
    let tdv = new TaskDockerVolume(new SequenceSpy([
      {name: 'info', args: ['volume "vol1" does not exist']}
    ]));

    await tdv.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/volumes'}], return: {data:{Volumes: [{Name: 'vol2'}]}}},
      {name: 'close'}
    ])}, {
      "volumeName": "vol1",
      "actions": ['remove']
    });
  });
});
