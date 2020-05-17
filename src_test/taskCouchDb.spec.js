import {TaskCouchDb} from '../bld/taskCouchDb';
import {SequenceSpy} from './sequenceSpy';

describe('TaskCouchDb', () => {
  it('can create a CouchDb', async () => {
    let tcd = new TaskCouchDb(new SequenceSpy([
      {name: 'update', args: ['created database "bookmark"']},
      {name: 'update', args: ['created database "_users"']},
      {name: 'update', args: ['updated security configuration for database "bookmark"']}
    ]));

    let secObj = {
      "admins": { "names": [], "roles": [ "bookmark_admin" ] },
      "members": { "names": [], "roles": [ "bookmark_read", "bookmark_write" ] }
    };

    await tcd.run({
      createRequest: () => new SequenceSpy([
        {name: 'open', args: [{protocol: 'http', host: '127.0.0.1', port: 5984, socketPath: undefined}]},
        {name: 'request', args: [{method: 'get', url: '/prefix/_all_dbs', auth: {"auth": "auth"}}], return: {data: ['bookmark1']}},
        {name: 'request', args: [{method: 'put', url: '/prefix/bookmark', auth: {"auth": "auth"}}]},
        {name: 'request', args: [{method: 'put', url: '/prefix/_users', auth: {"auth": "auth"}}]},
        {name: 'request', args: [{method: 'get', url: '/prefix/bookmark/_security', auth: {"auth": "auth"}}], return: {data: {}}},
        {name: 'request', args: [{method: 'put', url: '/prefix/bookmark/_security', auth: {"auth": "auth"}, data: secObj}]},
        {name: 'close'},
      ])
    }, {
      "name": "bookmark",
      "urlPrefix": "/prefix",
      "auth": { auth: 'auth' },
      "security": {
        "admins": { "names": [], "roles": [ "bookmark_admin" ] },
        "members": { "names": [], "roles": [ "bookmark_read", "bookmark_write" ] }
      }
    });
  });

  it('can recognize that a CouchDb already exists', async () => {
    let tcd = new TaskCouchDb(new SequenceSpy([
      {name: 'info', args: ['database "bookmark" already exists']},
      {name: 'info', args: ['database "_users" already exists']},
      {name: 'info', args: ['security configuration for database "bookmark" is up to date']}
    ]));

    let secObj = {
      "admins": { "names": [], "roles": [ "bookmark_admin" ] },
      "members": { "names": [], "roles": [ "bookmark_read", "bookmark_write" ] }
    };

    await tcd.run({
      createRequest: () => new SequenceSpy([
        {name: 'open', args: [{protocol: 'http', socketPath: '/var/run/docker.sock'}]},
        {name: 'request', args: [{method: 'get', url: '/containers/testContainer/json'}], return: {data: {NetworkSettings: {Networks: {testNetwork: {IPAddress: 'ipAddress'}}}}}},
        {name: 'close'},
        {name: 'open', args: [{protocol: 'http', host: 'ipAddress', port: 5984, socketPath: undefined}]},
        {name: 'request', args: [{method: 'get', url: '/_all_dbs', auth: {"auth": "auth"}}], return: {data: ['bookmark', '_users']}},
        {name: 'request', args: [{method: 'get', url: '/bookmark/_security', auth: {"auth": "auth"}}], return: {data: secObj}},
        {name: 'close'},
      ])
    }, {
      "name": "bookmark",
      "dockerContainer": "testContainer",
      "dockerNetwork": "testNetwork",
      "auth": { auth: 'auth' },
      "security": {
        "admins": { "names": [], "roles": [ "bookmark_admin" ] },
        "members": { "names": [], "roles": [ "bookmark_read", "bookmark_write" ] }
      }
    });
  });
});
