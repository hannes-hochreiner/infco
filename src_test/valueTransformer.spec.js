import * as fs from 'fs';
import * as crypto from 'crypto';
import {ValueTransformer} from '../bld/valueTransformer';

describe("ValueTransformer", function() {
  it("can insert vars", async function() {
    let vt = new ValueTransformer(fs, crypto, Date);

    vt.registerVars({
      test1: "test2"
    });
    expect(await vt.transform({"valueTransform":"var", "name":"test1"})).toEqual("test2");
  });

  it("can resolve nested transforms", async function() {
    let vt = new ValueTransformer(fs, crypto, Date);

    vt.registerVars({
      testInner: "test2"
    });
    expect(await vt.transform({valueTransform: 'prefixSuffix', text: {valueTransform:'var', name:'testInner'}, prefix: '-', suffix: '+'})).toEqual("-test2+");
  });

  it("can add a prefix and a suffix", async function() {
    let vt = new ValueTransformer(fs, crypto, Date);

    expect(await vt.transform({"valueTransform":"prefixSuffix", "text":"test1", "prefix": "_", "suffix": "*"})).toEqual("_test1*");
  });

  it("can insert a date", async function() {
    let vt = new ValueTransformer(fs, crypto, Date);

    expect(await vt.transform({"valueTransform":"utcTimestamp", "format": "ISO", "part":"date"})).toEqual((new Date()).toISOString().substr(0,10));
  });

  it("can insert a timestamp", async function() {
    let vt = new ValueTransformer(fs, crypto, Date.bind(null, '1995-12-17T03:24:00'));

    expect(await vt.transform({"valueTransform":"utcTimestamp"})).toEqual((new Date('1995-12-17T03:24:00')).toISOString());
  });
});
