import {TaskLineInFile} from '../bld/taskLineInFile';
import {SequenceSpy} from './sequenceSpy';

describe('TaskLineInFile', () => {
  it('can add a line to a file', async () => {
    let lif = new TaskLineInFile(new SequenceSpy([
      {name: 'update', args:['line was added to file "/tmp/test.txt"']}
    ]));

    await lif.run({
      createExec: () => new SequenceSpy([
        {name: 'open'},
        {name: 'exec', args: ['touch /tmp/test.txt']},
        {name: 'close'}
      ]),
      createTransfer: () => new SequenceSpy([
        {name: 'open'},
        {name: 'createReadStream', args: ['/tmp/test.txt'], return: {
          on: (event, cb) => {
            if (event == 'data') {
              cb('line1\nline2\n');
            } else if (event == 'end') {
              cb();
            }
          },
          setEncoding: enc => {
            expect(enc).toEqual('utf8');
          }
        }},
        {name: 'createWriteStream', args: ['/tmp/test.txt'], return: {
          on: (event, cb) => {
            expect(event).toEqual('error');
            expect(cb).not.toBeUndefined();
          },
          write: (str, cb) => {
            expect(str).toEqual('line1\nline2\ntest string\n');
            cb();
          },
          end: () => {}
        }},
        {name: 'close'}
      ])
    }, {
      "filename": "/tmp/test.txt",
      "line": "test string"
    });
  });

  it('can recognize that a line is already in a file', async () => {
    let lif = new TaskLineInFile(new SequenceSpy([
      {name: 'info', args:['line is already present in file "/tmp/test.txt"']}
    ]));

    await lif.run({
      createExec: () => new SequenceSpy([
        {name: 'open'},
        {name: 'exec', args: ['touch /tmp/test.txt']},
        {name: 'close'}
      ]),
      createTransfer: () => new SequenceSpy([
        {name: 'open'},
        {name: 'createReadStream', args: ['/tmp/test.txt'], return: {
          on: (event, cb) => {
            if (event == 'data') {
              cb('line1\ntest string\nline2\n');
            } else if (event == 'end') {
              cb();
            }
          },
          setEncoding: enc => {
            expect(enc).toEqual('utf8');
          }
        }},
        {name: 'close'}
      ])
    }, {
      "filename": "/tmp/test.txt",
      "line": "test string"
    });
  });
});
