export class TaskWait {
  constructor(logger) {
    this._logger = logger;
  }

  async run(context, config) {
    await this.wait(config.ms);
  }

  wait(ms) {
    return new Promise(resolve => {
      setTimeout(() => {
        this._logger.info(`waited for ${ms} ms`);
        resolve();
      }, ms);
    });
  }
}
