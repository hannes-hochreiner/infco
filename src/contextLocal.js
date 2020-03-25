import { ContextLocalExec } from './contextLocalExec';

export class ContextLocal {
  constructor(child_process) {
    this._child_process = child_process;
  }

  async open(config) {
    return Promise.resolve();
  }

  close() {
  }

  createExec() {
    return new ContextLocalExec(this);
  }

  async exec(command) {
    return new Promise((resolve, reject) => {
      this._child_process.exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }

        resolve(stdout);
      });
    });
  }
}
