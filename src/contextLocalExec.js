export class ContextLocalExec {
  constructor(contextLocal) {
    this._contextLocal = contextLocal;
  }

  exec(command) {
    return this._contextLocal.exec(command);
  }

  open() {
    return;
  }

  close() {
    return;
  }
}
