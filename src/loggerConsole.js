export class LoggerConsole {
  constructor(chalk) {
    this._chalk = chalk;
  }

  warn(str) {
    console.log(this._chalk.yellow(`  WARNING: ${str}`));
  }

  update(str) {
    console.log(`  UPDATE: ${str}`);
  }

  info(str) {
    console.log(this._chalk.grey(`  INFO: ${str}`));
  }
}
