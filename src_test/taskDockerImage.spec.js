import {TaskDockerImage} from '../bld/taskDockerImage';
import {SequenceSpy} from './sequenceSpy';

describe('TaskDockerImage', () => {
  it('can prune unused images', async () => {
    let tdi = new TaskDockerImage(new SequenceSpy([
      {name: 'update', args: ['pruned 2 images']}
    ]));

    await tdi.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'post', url: '/images/prune'}], return: {data:{ImagesDeleted: [1,2]}}},
      {name: 'close'}
    ])}, {
      "actions": ['prune']
    });
  });

  it('can create images', async () => {
    let tdi = new TaskDockerImage(new SequenceSpy([
      {name: 'update', args: ['created image "test:tag"']},
      {name: 'info', args: ['image "test2:tag" exists']}
    ]));

    await tdi.run({createRequest: () => new SequenceSpy([
      {name: 'open', args: [{protocol: 'http', host: undefined, port: undefined, socketPath: '/var/run/docker.sock'}]},
      {name: 'request', args: [{method: 'get', url: '/images/json'}], return: {data:[{RepoTags: ["test2:tag"]}]}},
      {name: 'request', args: [{method: 'post', url: '/images/create', params: {fromImage: 'test:tag'}}]},
      {name: 'close'}
    ])}, {
      "images": ["test:tag", "test2:tag"],
      "actions": ['create']
    });
  });
});
