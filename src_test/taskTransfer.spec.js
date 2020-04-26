import {TaskTransfer} from '../bld/taskTransfer';
import {SequenceSpy} from './sequenceSpy';

describe('TaskTransfer', () => {
  it('can transfer a file from local to remote', async () => {
    let tr = new TaskTransfer(new SequenceSpy([
      {name: 'update', args: ['transmitted file from "/tmp/test.txt" to "/tmp/test2.txt"']}
    ]));

    await tr.run({
      createTransfer: () => new SequenceSpy([
        {name: 'open'},
        {name: 'put', args:['/tmp/test.txt', '/tmp/test2.txt']},
        {name: 'close'}
      ])
    }, {
      "direction": "put",
      "localPath": "/tmp/test.txt",
      "remotePath": "/tmp/test2.txt"
    });
  });

  it('can transfer a file from remote to local', async () => {
    let tr = new TaskTransfer(new SequenceSpy([
      {name: 'update', args: ['received file from "/tmp/test2.txt" to "/tmp/test.txt"']}
    ]));

    await tr.run({
      createTransfer: () => new SequenceSpy([
        {name: 'open'},
        {name: 'get', args:['/tmp/test2.txt', '/tmp/test.txt']},
        {name: 'close'}
      ])
    }, {
      "direction": "get",
      "localPath": "/tmp/test.txt",
      "remotePath": "/tmp/test2.txt"
    });
  });
});
