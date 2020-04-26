import {TaskFileFromString} from '../bld/taskFileFromString';
import {SequenceSpy} from './sequenceSpy';

describe('TaskFileFromString', () => {
  it('can create a file from a string', async () => {
    let ffs = new TaskFileFromString(new SequenceSpy([
      {name: 'update', args:['wrote file "/tmp/test.txt"']}
    ]));

    await ffs.run({
      createExec: () => new SequenceSpy([
        {name: 'open'},
        {name: 'exec', args: ['touch /tmp/test.txt']},
        {name: 'close'}
      ]),
      createTransfer: () => new SequenceSpy([
        {name: 'open'},
        {name: 'createWriteStream', args: ['/tmp/test.txt'], return: {
          on: (event, cb) => {
            expect(event).toEqual('error');
            expect(cb).not.toBeUndefined();
          },
          write: (str, cb) => {
            expect(str).toEqual('test string');
            cb();
          },
          end: () => {}
        }},
        {name: 'close'}
      ])
    }, {
      "filename": "/tmp/test.txt",
      "string": "test string"
    });
  });
});
