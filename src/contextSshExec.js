export class ContextSshExec {
  constructor(contextSsh) {
    this._contextSsh = contextSsh;
  }

  exec(command) {
    return this._contextSsh.exec(command);
  }

  open() {
    return;
  }

  close() {
    return;
  }
}
