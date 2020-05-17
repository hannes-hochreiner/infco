import {TaskCouchDbDoc} from '../bld/taskCouchDbDoc';
import {SequenceSpy} from './sequenceSpy';

describe('TaskCouchDbDoc', () => {
  it('can create a CouchDb document', async () => {
    let tcdd = new TaskCouchDbDoc(new SequenceSpy([
      {name: 'update', args: ['document at "/url" was updated']}
    ]));

    await tcdd.run({
      createRequest: () => new SequenceSpy([
        {name: 'open', args: [{protocol: 'http', host: '127.0.0.1', port: 5984, socketPath: undefined}]},
        {name: 'request', args: [{method: 'get', url: '/url', auth: {"auth": "auth"}}], return: {data: {_id: 'id', _rev: 'rev', doc: 'doc'}}},
        {name: 'request', args: [{method: 'put', url: '/url', auth: {"auth": "auth"}, data: {_id:'id',_rev:'rev',doc:'newDoc'}}]},
        {name: 'close'},
      ])
    }, {
      "url": "/url",
      "content": '{"doc": "newDoc"}',
      "auth": { auth: 'auth' },
    });
  });

  it('can recognize that a CouchDb document exists', async () => {
    let tcdd = new TaskCouchDbDoc(new SequenceSpy([
      {name: 'info', args: ['document at "/url" is up to date']}
    ]));

    await tcdd.run({
      createRequest: () => new SequenceSpy([
        {name: 'open', args: [{protocol: 'http', socketPath: '/var/run/docker.sock'}]},
        {name: 'request', args: [{method: 'get', url: '/containers/testContainer/json'}], return: {data: {NetworkSettings: {Networks: {testNetwork: {IPAddress: 'ipAddress'}}}}}},
        {name: 'close'},
        {name: 'open', args: [{protocol: 'http', host: 'ipAddress', port: 5984, socketPath: undefined}]},
        {name: 'request', args: [{method: 'get', url: '/url', auth: {"auth": "auth"}}], return: {data: {_id: 'id', _rev: 'rev', doc: 'newDoc'}}},
        {name: 'close'},
      ])
    }, {
      "url": "/url",
      "dockerContainer": "testContainer",
      "dockerNetwork": "testNetwork",
      "content": '{"doc": "newDoc"}',
      "auth": { auth: 'auth' },
    });
  });
});
