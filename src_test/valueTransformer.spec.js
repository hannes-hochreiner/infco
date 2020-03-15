import {ValueTransformer} from '../bld/valueTransformer';

describe("ValueTransformer", function() {
  it("can insert vars", async function() {
    let vt = new ValueTransformer();

    vt.registerVars({
      test1: "test2"
    });
    expect(await vt.transform({"valueTransform":"var", "name":"test1"})).toEqual("test2");
  });

  it("can insert vars with prefix and suffix", async function() {
    let vt = new ValueTransformer();

    vt.registerVars({
      test1: "test2"
    });
    expect(await vt.transform({"valueTransform":"var", "name":"test1", "prefix": "_", "suffix": "*"})).toEqual("_test2*");
  });
});
