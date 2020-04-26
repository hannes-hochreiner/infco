export class TaskFileFromString {
  constructor(logger) {
    this._logger = logger;
  }

  async run(context, config) {
    let ctxExec;
    let ctxTrans;

    try {
      ctxExec = context.createExec();
      await ctxExec.open();
      ctxTrans = context.createTransfer();
      await ctxTrans.open();

      // ensure the file exists
      await ctxExec.exec(`touch ${config.filename}`);

      let writeStream = ctxTrans.createWriteStream(config.filename);

      await (new Promise((resolve, reject) => {
        writeStream.on('error', error => reject(error));
        writeStream.write(config.string, () => {
          writeStream.end();
          this._logger.update(`wrote file "${config.filename}"`);
          resolve();
        });
      }));
    } finally {
      if (typeof ctxExec !== 'undefined') {
        await ctxExec.close();
      }
      if (typeof ctxTrans !== 'undefined') {
        await ctxTrans.close();
      }
    }
  }
}
