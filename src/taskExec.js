export class TaskExec {
  constructor(logger) {
    this._logger = logger;
  }

  async run(context, config) {
    let ctxExec = context.createExec();

    try {
      await ctxExec.open();
      let commands = [config.command].flat(Infinity);

      for (const command of commands) {
        await ctxExec.exec(command);
        this._logger.update(`executed command "${command}"`);
      }
    } finally {
      if (typeof ctxExec !== 'undefined') {
        await ctxExec.close();
      }
    }
  }
}
