export class InfCo {
  constructor(valueTransformer, contextDict, taskDict) {
    this._valueTransformer = valueTransformer;
    this._contextDict = contextDict;
    this._taskDict = taskDict;
  }

  async process(tasks, hosts) {
    let hostList = await this._valueTransformer.transform(hosts);
    let varList = await this._valueTransformer.transform(tasks.vars || {});
    this._valueTransformer.registerVars(varList);
    let taskList = await this._valueTransformer.transform(tasks.tasks);
    let taskTags = tasks.tags || [];
    let filteredHostList = this._filterHostsByTags(hostList.hosts, taskTags);

    for (let hostIdx in filteredHostList) {
      await this._processHost(filteredHostList[hostIdx], taskList);
    }
  }
  
  async _processHost(host, taskList) {
    console.log(`===== ${host.title} =====`);

    if (!this._contextDict.hasOwnProperty(host.context.type)) {
      throw new Error(`Context "${host.context}" is unknown.`);
    }
    
    let context = this._contextDict[host.context.type];
  
    try {
      await context.open(host.context.config);
  
      for (let taskIdx in taskList) {
        let task = taskList[taskIdx];
  
        if (!this._taskDict.hasOwnProperty(task.type)) {
          throw new Error(`Task "${task.type}" is unknown.`);
        }

        console.log(`${task.title}: ${(await this._taskDict[task.type].run(context, task.config))}`);
      }
    } finally {
      context.close();
    }
  }
  
  _filterHostsByTags(hosts, tags) {
    return hosts.filter(host => (host.tags || []).some(tag => tags.includes(tag)));
  }
}
