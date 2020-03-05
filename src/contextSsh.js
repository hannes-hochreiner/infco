import { ContextSshRequest } from './contextSshRequest';
import { ContextSshExec } from './contextSshExec';
import { ContextSshTransfer } from './contextSshTransfer';

export class ContextSsh {
  constructor(ssh, net, axios) {
    this._ssh = ssh;
    this._net = net;
    this._axios = axios;
    this._open = false;
  }

  async open(config) {
    if (this._open) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this._ssh.on('ready', () => {
        this._open = true;
        resolve();
        return;
      }).on('error', (error) => {
        this._open = false;
        reject(error);
        return;
      });

      this._ssh.connect(config);
    });
  }

  close() {
    if (!this._open) {
      return;
    }

    this._ssh.end();
    this._open = false;
  }

  createExec() {
    return new ContextSshExec(this);
  }

  createRequest() {
    return new ContextSshRequest(this, this._net, this._axios);
  }

  createTransfer() {
    return new ContextSshTransfer(this);
  }

  sftp() {
    return new Promise((resolve, reject) => {
      this._ssh.sftp((error, sftp) => {
        if (typeof error !== 'undefined') {
          reject(error);
          return;
        }

        resolve(sftp);
      });
    });
  }

  async exec(command) {
    return new Promise((resolve, reject) => {
      this._ssh.exec(command, (error, channel) => {
        if (error) {
          reject(error);
          return;
        }
  
        let output = '';
  
        channel.on('data', (data) => {
          output += data;
        }).on('close', (_code, _signal) => {
          resolve(output);
          return;
        });
      });
    });
  }

  async openSshForwardOut(socketPath) {
    return new Promise((resolve, reject) => {
      this._ssh.openssh_forwardOutStreamLocal(socketPath, function(error, stream) {
        if (error) {
          reject(error);
          return;
        }

        resolve(stream);
      });
    });
  }

  async forwardOut(srcAddress, srcPort, dstAddress, dstPort) {
    return new Promise((resolve, reject) => {
      this._ssh.forwardOut(srcAddress, srcPort, dstAddress, dstPort, (error, stream) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(stream);
      });
    });
  }
}
