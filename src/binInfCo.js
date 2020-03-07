#!/usr/bin/env node

import { Client } from "ssh2";
import { ContextSsh } from './contextSsh';
import { default as Axios } from 'axios';
import * as net from 'net';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { default as commander } from 'commander';
import { InfCo } from './infCo';
import { ValueTransformer } from './valueTransformer';
import { TaskExec } from './taskExec';
import { TaskRequest } from './taskRequest';
import { TaskTransfer } from './taskTransfer';
import { TaskCouchDb } from './taskCouchDb';
import { TaskCouchDbDoc } from './taskCouchDbDoc';
import { TaskDockerContainer } from './taskDockerContainer';
import { TaskDockerNetwork } from './taskDockerNetwork';
import { TaskGitHubDeployLatestRelease } from './taskGitHubDeployLatestRelease';

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
    let hosts = await readJson(cmdObj.hosts);
    let tasks = await readJson(cmdObj.tasks);
    let taskDict = {
      exec: TaskExec,
      request: TaskRequest,
      transfer: TaskTransfer,
      couchDb: TaskCouchDb,
      couchDbDocument: TaskCouchDbDoc,
      dockerContainer: TaskDockerContainer,
      dockerNetwork: TaskDockerNetwork,
      gitHubDeployLatestRelease: TaskGitHubDeployLatestRelease
    };
    let contextDict = {
      contextSsh: new ContextSsh(new Client(), net, Axios)
    };
    const valueTransformer = new ValueTransformer(fs, crypto);

    let infCo = new InfCo(valueTransformer, contextDict, taskDict);

    await infCo.process(tasks, hosts);
  } catch (error) {
    console.log(error);    
  } finally {
    process.exit();
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
