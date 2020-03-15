import {InfCo} from '../bld/infCo';

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
});
