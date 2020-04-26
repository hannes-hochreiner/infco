import {TaskRequest} from '../bld/taskRequest';
import {SequenceSpy} from './sequenceSpy';

describe('TaskRequest', () => {
  it('can create send a request', async () => {
    let tr = new TaskRequest(new SequenceSpy([
      {name: 'update', args: ['request was executed']}
    ]));

    await tr.run({
      createRequest: () => new SequenceSpy([
        {name: 'open', args: [{protocol: 'http', host: '127.0.0.1', port: 80}]},
        {name: 'request', args: [{method: 'get', url: '/url'}]},
        {name: 'close'},
      ])
    }, {
      "host": "127.0.0.1",
      "protocol": "http",
      "port": 80,
      "url": "/url",
      "method": "get"
    });
  });
});
