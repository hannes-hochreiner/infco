import {InfCo} from '../bld/infCo';
import {ValueTransformer} from '../bld/valueTransformer';
import { default as Mustache } from 'mustache';

describe("InfCo", function() {
  it("can filter hosts by tags", async function() {
    let infCo = new InfCo();
    let hosts = [
      {tags: ["test1"]},
      {tags: ["test2"]},
      {tags: ["test3"]}
    ];
    let tags = ["test2"];

    expect(infCo._filterHostsByTags(hosts, tags)).toEqual([{tags: ["test2"]}]);
  });

  it("can process task and host lists", async function() {
    let infCo = new InfCo(new ValueTransformer(null, null, null, Mustache));
    let hostList = {
      hosts: [
        {tags: ["test1"]},
        {tags: ["test2"]},
        {tags: ["test3"]}
      ]
    };
    let taskList = {
      tasks: [
        {
          title: {valueTransform: 'prefixSuffix', value: 'test', prefix: '*'}
        }
      ]
    };

    await infCo.process(taskList, hostList);
  });
});
