export class TaskLineInFile {
  static async run(context, config) {
    let ctxExec;
    let ctxTrans;

    try {
      ctxExec = context.createExec();
      await ctxExec.open();
      ctxTrans = context.createTransfer();
      await ctxTrans.open();

      // ensure the file exists
      await ctxExec.exec(`touch ${config.filename}`);

      let readStream = ctxTrans.createReadStream(config.filename);

      readStream.setEncoding(config.encoding || 'utf8');

      let content = await (new Promise((resolve, reject) => {
        let cnt = '';

        readStream.on('data', chunk => cnt += chunk);
        readStream.on('error', error => reject(error));
        readStream.on('end', () => resolve(cnt));
      }));

      let lines = content.split('\n');

      // check whether line is contained
      if (lines.includes(config.line)) {
        return 'ok';
      }

      // pop off trailing line break
      let hasTrail = false;

      if (lines[lines.length - 1] === '') {
        hasTrail = true;
        lines.pop();
      }

      // add the line
      lines.push(config.line);

      // put trailing break back, if it was on before
      if (hasTrail) {
        lines.push('');
      }

      let writeStream = ctxTrans.createWriteStream(config.filename);

      await (new Promise((resolve, reject) => {
        writeStream.on('error', error => reject(error));
        writeStream.write(lines.join('\n'), () => {
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