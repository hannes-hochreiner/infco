#!/usr/bin/env node

import { Client } from "ssh2";
import { ContextSsh } from './contextSsh';
import { ContextLocal } from './contextLocal';
import { default as Axios } from 'axios';
import * as net from 'net';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import * as child_process from 'child_process';
import { default as commander } from 'commander';
import { default as Mustache } from 'mustache';
import {default as chalk} from 'chalk';
import { Docker, Composter } from 'docker-composter';
import { InfCo } from './infCo';
import { LoggerConsole } from './loggerConsole';
import { ValueTransformer } from './valueTransformer';
import { TaskExec } from './taskExec';
import { TaskRequest } from './taskRequest';
import { TaskTransfer } from './taskTransfer';
import { TaskCouchDb } from './taskCouchDb';
import { TaskCouchDbDoc } from './taskCouchDbDoc';
import { TaskDockerContainer } from './taskDockerContainer';
import { TaskDockerImage } from './taskDockerImage';
import { TaskDockerNetwork } from './taskDockerNetwork';
import { TaskDockerVolume } from './taskDockerVolume';
import { TaskLineInFile } from './taskLineInFile';
import { TaskReviewBackups } from './taskReviewBackups';
import { TaskFileFromString } from './taskFileFromString';
import { TaskDockerComposter } from './taskDockerComposter';
import { TaskWait } from './taskWait';

const logger = new LoggerConsole(chalk);
const valueTransformer = new ValueTransformer(fs, crypto, Date, Mustache);

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
      exec: new TaskExec(logger),
      request: new TaskRequest(logger),
      transfer: new TaskTransfer(logger),
      couchDb: new TaskCouchDb(logger),
      couchDbDocument: new TaskCouchDbDoc(logger),
      dockerComposter: new TaskDockerComposter(logger, Composter, Docker),
      dockerContainer: new TaskDockerContainer(logger),
      dockerImage: new TaskDockerImage(logger),
      dockerNetwork: new TaskDockerNetwork(logger),
      dockerVolume: new TaskDockerVolume(logger),
      lineInFile: new TaskLineInFile(logger),
      reviewBackups: new TaskReviewBackups(logger, Date, path),
      fileFromString: new TaskFileFromString(logger),
      wait: new TaskWait(logger)
    };
    let contextDict = {
      contextSsh: new ContextSsh(new Client(), net, Axios),
      contextLocal: new ContextLocal(child_process)
    };

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
