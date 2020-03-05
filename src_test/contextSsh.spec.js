import {ContextSsh} from '../bld/contextSsh';

describe("ContextSsh", function() {
  it("can execute shell commands", async function() {
    let sshMock = new SshMock();
    let ssh = new ContextSsh(sshMock);
    let config = {};

    await ssh.open(config);
    expect(sshMock.eventHandler.ready).toBeDefined();
    expect(sshMock.eventHandler.error).toBeDefined();
    expect(sshMock.config).toEqual(config);
  });
});

class SshMock {
  constructor() {
    this.eventHandler = {};
  }

  on(event, fun) {
    this.eventHandler[event] = fun;

    return this;
  }

  connect(config) {
    this.config = config;
  }
}