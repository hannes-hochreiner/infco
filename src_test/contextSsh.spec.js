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

    let exec = ssh.createExec();
    let command = "test";
    exec.exec(command);
    expect(sshMock.command).toEqual(command);
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

    this.eventHandler["ready"]();
  }

  exec(command) {
    this.command = command;
  }
}