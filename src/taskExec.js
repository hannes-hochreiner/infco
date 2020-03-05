export class TaskExec {
  static async run(context, config) {
    let ctxExec;

    try {
      ctxExec = context.createExec();
      await ctxExec.open();
      await ctxExec.exec(config.command);
    } finally {
      if (typeof ctxExec !== 'undefined') {
        await ctxExec.close();
      }
    }

    return 'executed';
  }
}
