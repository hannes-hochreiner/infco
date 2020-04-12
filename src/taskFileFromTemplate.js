export class TaskFileFromTemplate {
  constructor(mustache) {
    this._mustache = mustache;
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
        writeStream.write(this._mustache.render(config.template, config.data), () => {
          writeStream.end();
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

    return 'updated';
  }
}
