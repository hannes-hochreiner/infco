export class TaskTransfer {
  static async run(context, config) {
    let ctxTrans;

    try {
      ctxTrans = context.createTransfer();
      await ctxTrans.open();

      if (config.direction == 'get') {
        await ctxTrans.get(config.remotePath, config.localPath);
      } else if (config.direction == 'put') {
        await ctxTrans.put(config.localPath, config.remotePath);
      } else {
        throw new Error(`Unknown transfer direction "${config.direction}".`);
      }
    } finally {
      if (typeof ctxTrans !== 'undefined') {
        await ctxTrans.close();
      }
    }

    return 'transferred';
  }
}