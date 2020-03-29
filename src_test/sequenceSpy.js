export class SequenceSpy {
  constructor(config) {
    this._config = config;

    for (let idx in this._config) {
      let funName = this._config[idx].name;
      this[funName] = this.fun.bind(this, funName);
    }
  }

  fun(funName, ...args) {
    let step = this._config.shift();

    expect(step.name).toEqual(funName);

    if (typeof step.args !== 'undefined') {
      expect(step.args).toEqual(args);
    }

    if (typeof step.return !== 'undefined') {
      return step.return;
    }
  }
}
