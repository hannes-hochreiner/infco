export class TaskReviewBackups {
  constructor(logger, DateType, path) {
    this._logger = logger;
    this._DateType = DateType;
    this._path = path;
  }

  async run(context, config) {
    let ctxExec;

    try {
      ctxExec = context.createExec();
      await ctxExec.open();
      let today = (new this._DateType());
      let msecsToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
      let list = (await ctxExec.exec(`ls -1 ${config.path} | grep -E '^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}${config.suffix}'`)).trim().split('\n');
      // iterate over list put items into new list where the index in the new array is the age in days
      let backupDates = [];
      list.forEach(elem => {
        if (elem.length < 10) {
          return;
        }

        let tokens = elem.substr(0,10).split('-');

        if (tokens.length < 3) {
          return;
        }

        let daysPast = Math.round((msecsToday - Date.UTC(parseInt(tokens[0]), parseInt(tokens[1]) - 1, parseInt(tokens[2]))) / (1000 * 60 * 60 * 24));

        if (daysPast < 0) {
          return;
        }

        backupDates[daysPast] = elem;
      });
      
      let deleteList = [];

      config.days.sort((a, b) => a-b).forEach((days, idx) => {
        let slice = [];

        if (idx === 0) {
          slice = backupDates.slice(0, days + 1);
        } else {
          slice = backupDates.slice(config.days[idx - 1] + 1, days + 1);
        }

        // filter out empty items, to make slice.length work as expected
        slice = slice.filter(elem => elem);
        slice.forEach((delElem, delIdx) => {
          if (delIdx === slice.length - 1) {
            return;
          }

          deleteList.push(delElem);
        });
      });

      backupDates.slice(config.days[config.days.length - 1] + 1).forEach(elem => {
        deleteList.push(elem);
      });

      deleteList.forEach(async (elem) => {
        await ctxExec.exec(`rm ${this._path.join(config.path, elem)}`);
        this._logger.update(`deleted file "${this._path.join(config.path, elem)}"`);
      });
    } finally {
      if (typeof ctxExec !== 'undefined') {
        await ctxExec.close();
      }
    }
  }
}
