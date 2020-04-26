export class TaskTransfer {
  constructor(logger) {
    this._logger = logger;
  }

  async run(context, config) {
    let ctxTrans;

    try {
      ctxTrans = context.createTransfer();
      await ctxTrans.open();

      if (config.direction == 'get') {
        await ctxTrans.get(config.remotePath, config.localPath);
        this._logger.update(`received file from "${config.remotePath}" to "${config.localPath}"`);
      } else if (config.direction == 'put') {
        await ctxTrans.put(config.localPath, config.remotePath);
        this._logger.update(`transmitted file from "${config.localPath}" to "${config.remotePath}"`);
      } else {
        throw new Error(`Unknown transfer direction "${config.direction}".`);
      }
    } finally {
      if (typeof ctxTrans !== 'undefined') {
        await ctxTrans.close();
      }
    }
  }
}