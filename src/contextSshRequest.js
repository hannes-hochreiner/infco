export class ContextSshRequest {
  constructor(contextSsh, net, Axios) {
    this._contextSsh = contextSsh;
    this._net = net;
    this._Axios = Axios;
  }

  async open(config) {
    this._server = this._net.createServer(async (socket) => {
      let stream;

      if (config.socketPath) {
        stream = await this._contextSsh.openSshForwardOut(config.socketPath);
      } else if (config.host && config.port) {
        stream = await this._contextSsh.forwardOut(socket.remoteAddress, socket.remotePort, config.host, config.port);
      }

      socket.pipe(stream);
      stream.pipe(socket);
    });
    await this._listen();

    let baseURL;
    let address = this._server.address();

    if (address.family === 'IPv4') {
      baseURL = `${config.protocol}://${address.address}:${address.port}`;
    } else if (address.family === 'IPv6') {
      baseURL = `${config.protocol}://[${address.address}]:${address.port}`;
    }

    this._axios = this._Axios.create({baseURL: baseURL});
  }

  request(config) {
    return this._axios(config);
  }

  async close() {
    return new Promise((resolve) => {
      this._server.close(() => {
        resolve();
      });
    });
  }

  _listen() {
    return new Promise((resolve) => {
      this._server.listen(() => {
        resolve();
      });
    });
  }
}
