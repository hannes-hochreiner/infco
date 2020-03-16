import {ValueTransformer} from '../bld/valueTransformer';

describe("ValueTransformer", function() {
  it("can insert vars", async function() {
    let vt = new ValueTransformer();

    vt.registerVars({
      test1: "test2"
    });
    expect(await vt.transform({"valueTransform":"var", "name":"test1"})).toEqual("test2");
  });

  it("can insert resolve nested transforms", async function() {
    let vt = new ValueTransformer();

    vt.registerVars({
      testInner: "test2"
    });
    expect(await vt.transform({valueTransform: 'prefixSuffix', text: {valueTransform:'var', name:'testInner'}, prefix: '-', suffix: '+'})).toEqual("-test2+");
  });

  it("can add a prefix and a suffix", async function() {
    let vt = new ValueTransformer();

    expect(await vt.transform({"valueTransform":"prefixSuffix", "text":"test1", "prefix": "_", "suffix": "*"})).toEqual("_test1*");
  });
});
