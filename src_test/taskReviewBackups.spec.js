import * as path from 'path';
import {SequenceSpy} from './sequenceSpy';
import {TaskReviewBackups} from '../bld/taskReviewBackups';

describe("TaskReviewBackups", function() {
  it("can review backups (1)", async function() {
    let context = {
      createExec: () => {
        return new SequenceSpy([
          {name: 'open'},
          {name: 'exec', args: ['ls -1 /test | grep -E \'^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_test.txt\''], return: '2020-02-02_test.txt\n2020-02-03_test.txt\n2020-02-04_test.txt\n'},
          {name: 'exec', args: ['rm /test/2020-02-02_test.txt']},
          {name: 'close'}
        ]);
      }
    };
    let config = {
      path: '/test',
      days: [0,1],
      suffix: '_test.txt'
    };

    let trb = new TaskReviewBackups(Date.bind(null, '2020-02-04'), path);
    
    await trb.run(context, config);
  });

  it("can review backups (2)", async function() {
    let context = {
      createExec: () => {
        return new SequenceSpy([
          {name: 'open'},
          {name: 'exec', args: ['ls -1 /test | grep -E \'^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_test.txt\''], return: '2019-01-20_test.txt\n2020-01-20_test.txt\n2020-02-03_test.txt\n2020-02-04_test.txt\n'},
          {name: 'exec', args: ['rm /test/2020-02-04_test.txt']},
          {name: 'exec', args: ['rm /test/2019-01-20_test.txt']},
          {name: 'close'}
        ]);
      }
    };
    let config = {
      path: '/test',
      days: [2,30],
      suffix: '_test.txt'
    };

    let trb = new TaskReviewBackups(Date.bind(null, '2020-02-04'), path);
    
    await trb.run(context, config);
  });
});
