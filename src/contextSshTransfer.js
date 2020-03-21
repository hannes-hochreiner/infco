export class ContextSshTransfer {
  constructor(contextSsh) {
    this._contextSsh = contextSsh;
  }

  get(remotePath, localPath) {
    return new Promise((resolve, reject) => {
      this._sftp.fastGet(remotePath, localPath, (error) => {
        if (typeof error !== 'undefined') {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  put(localPath, remotePath) {
    return new Promise((resolve, reject) => {
      this._sftp.fastPut(localPath, remotePath, (error) => {
        if (typeof error !== 'undefined') {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  createReadStream(path, options) {
    return this._sftp.createReadStream(path, options);
  }

  createWriteStream(path, options) {
    return this._sftp.createWriteStream(path, options);
  }

  async open() {
    this._sftp = await this._contextSsh.sftp();
  }

  close() {
    delete this._sftp;
    return;
  }
}
