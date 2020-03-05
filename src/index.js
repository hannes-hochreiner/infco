import { Client } from "ssh2";
import { ContextSsh } from './contextSsh';
import { default as Axios } from 'axios';
import * as net from 'net';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { default as commander } from 'commander';
import { ValueTransformer } from './valueTransformer';
import { TaskExec } from './taskExec';
import { TaskRequest } from './taskRequest';
import { TaskTransfer } from './taskTransfer';
import { TaskCouchDb } from './taskCouchDb';
import { TaskCouchDbDoc } from './taskCouchDbDoc';
import { TaskDockerContainer } from './taskDockerContainer';
import { TaskDockerNetwork } from './taskDockerNetwork';
import { TaskGitHubDeployLatestRelease } from './taskGitHubDeployLatestRelease';

const valueTransformer = new ValueTransformer(fs, crypto);

commander.command('encrypt <value>')
  .action(cmdEncrypt);
commander.command('process')
  .option('-h, --hosts <path>', 'list of hosts')
  .option('-t, --tasks <path>', 'list of tasks')
  .action(cmdProcess);
commander.parse(process.argv);

async function cmdEncrypt(value) {
  try {
    console.log(JSON.stringify(await valueTransformer.encrypt(value)));
  } catch (error) {
    console.log(error);
  } finally {
    process.exit();
  }
}

async function cmdProcess(cmdObj) {
  try {
    let hostList = await transformValues(await readJson(cmdObj.hosts), valueTransformer);
    let taskListFile = await readJson(cmdObj.tasks);
    let varList = await transformValues(taskListFile.vars || {}, valueTransformer);
    valueTransformer.registerVars(varList);
    let taskList = await transformValues(taskListFile.tasks, valueTransformer);
    let taskDict = {};
    taskDict['exec'] = TaskExec;
    taskDict['request'] = TaskRequest;
    taskDict['transfer'] = TaskTransfer;
    taskDict['couchDb'] = TaskCouchDb;
    taskDict['couchDbDocument'] = TaskCouchDbDoc;
    taskDict['dockerContainer'] = TaskDockerContainer;
    taskDict['dockerNetwork'] = TaskDockerNetwork;
    taskDict['gitHubDeployLatestRelease'] = TaskGitHubDeployLatestRelease;
  
    for (let hostIdx in hostList.hosts) {
      await processHost(hostList.hosts[hostIdx], taskList, taskDict);
    }
  } catch (error) {
    console.log(error);    
  } finally {
    process.exit();
  }
}

async function processHost(host, taskList, taskDict) {
  console.log(`===== ${host.title} =====`);
  let context;

  if (host.context.type === 'contextSsh') {
    context = new ContextSsh(new Client(), net, Axios);
  } else {
    throw new Error(`Context "${host.context}" is unknown.`);
  }

  try {
    await context.open(host.context.config);

    for (let taskIdx in taskList) {
      let task = taskList[taskIdx];

      console.log(`${task.title}: ${(await taskDict[task.type].run(context, task.config))}`);
    }
  } finally {
    context.close();
  }
}

async function transformValues(obj, valueTransformer) {
  if (obj instanceof Array) {
    for (let idx in obj) {
      obj[idx] = await transformValues(obj[idx], valueTransformer);
    }
    return obj;
  } else if (obj instanceof Object) {
    let res = {};
  
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] instanceof Object) {
          if (obj[key].valueTransform) {
            res[key] = await valueTransformer.transform(obj[key]);
          } else {
            res[key] = await transformValues(obj[key], valueTransformer);
          }
        } else {
          res[key] = obj[key];
        }
      }
    }
  
    return res;
  } else {
    return obj;
  }
}

function readJson(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (error, data) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(JSON.parse(data));
    });
  });
}
