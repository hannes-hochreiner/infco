import {TaskExec} from '../bld/taskExec';
import {SequenceSpy} from './sequenceSpy';

describe('TaskExec', () => {
  it('can execute a command', async () => {
    let exec = new TaskExec(new SequenceSpy([
      {name: 'update', args: ['executed command "test"']}
    ]));

    await exec.run({createExec: () => new SequenceSpy([
      {name: 'open'},
      {name: 'exec', args: ['test']},
      {name: 'close'}
    ])}, {
      command: 'test'
    });
  });

  it('can execute an array of commands', async () => {
    let exec = new TaskExec(new SequenceSpy([
      {name: 'update', args: ['executed command "test1"']},
      {name: 'update', args: ['executed command "test2"']}
    ]));

    exec.run({createExec: () => new SequenceSpy([
      {name: 'open'},
      {name: 'exec', args: ['test1']},
      {name: 'exec', args: ['test2']},
      {name: 'close'}
    ])}, {
      command: ['test1', 'test2']
    });
  });
});
