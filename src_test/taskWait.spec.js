import {TaskWait} from '../bld/taskWait';
import {SequenceSpy} from './sequenceSpy';

describe('TaskWait', () => {
  it('can wait', async () => {
    let tw = new TaskWait(new SequenceSpy([
      {name: 'info', args: ['waited for 100 ms']}
    ]));

    const waitMs = 100;
    let startTime = new Date();

    await tw.run({}, {
      ms: waitMs
    });

    let dur = (new Date()) - startTime;

    expect(Math.abs(dur / waitMs - 1)).toBeLessThan(0.07);
  });
});
