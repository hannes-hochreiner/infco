export class ValueTransformer {
  constructor(fs, crypto, DateType) {
    this._fs = fs;
    this._crypto = crypto;
    this._vars = {};
    this._DateType = DateType;
  }

  registerVars(vars) {
    Object.getOwnPropertyNames(vars).forEach(elem => {
      this._vars[elem] = vars[elem];
    });
  }

  async transform(obj) {
    if (obj instanceof Array) {
      for (let idx in obj) {
        obj[idx] = await this.transform(obj[idx]);
      }
      return obj;
    } else if (obj instanceof Object) {
      let res = {};
    
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] instanceof Object) {
            res[key] = await this.transform(obj[key]);
          } else {
            res[key] = obj[key];
          }
        }
      }
    
      if (obj.valueTransform) {
        return await this._replaceValue(res);
      } else {
        return res;
      }
    } else {
      return obj;
    }
  }

  async _replaceValue(config) {
    if (config.valueTransform == 'replaceByFileContents') {
      return new Promise((resolve, reject) => {
        this._fs.readFile(config.path, (error, data) => {
          if (error) {
            reject(error);
            return;
          }

          if (config.format == 'buffer') {
            resolve(data);
          } else if (config.format == 'string') {
            resolve(data.toString('utf-8'));
          } else {
            throw new Error('Unknown format');
          }
        });
      });
    } else if (config.valueTransform == 'decrypt') {
      if (typeof this._decryptionPassword === 'undefined') {
        this._decryptionPassword = await this.prompt('Please enter the decryption password: ');
      }

      let decryptionKey = this.hash(`${this._decryptionPassword}${config.salt}`, config.hashAlgorithm);
      let decipher = this._crypto.createDecipheriv(config.cipherAlgorithm, Buffer.from(decryptionKey, 'hex'), Buffer.from(config.iv, 'hex'));
      let decrypted = decipher.update(config.value, 'hex', 'utf8');
      
      decrypted += decipher.final('utf8');
      return Promise.resolve(decrypted);
    } else if (config.valueTransform == 'var') {
      if (!this._vars.hasOwnProperty(config.name)) {
        throw new Error(`Property "${config.name}" is not registered with the value transformer.`);
      }

      return Promise.resolve(this._vars[config.name]);
    } else if (config.valueTransform == 'prefixSuffix') {
      let prefix = config.prefix || '';
      let suffix = config.suffix || '';

      return Promise.resolve(`${prefix}${config.text}${suffix}`);
    } else if (config.valueTransform == 'utcTimestamp') {
      const formatOptions = ['ISO'];
      const partOptions = ['full', 'date'];
      let format = config.format || 'ISO';
      let part = config.part || 'full';

      if (!formatOptions.includes(format)) {
        throw new Error(`Format "${format}" unknown.`);
      }

      if (!partOptions.includes(part)) {
        throw new Error(`Part "${part}" unknown.`);
      }

      let res = (new this._DateType()).toISOString();

      if (part === 'date') {
        res = res.substr(0,10);
      }

      return Promise.resolve(res);
    }

    throw new Error(`Unknown value transform "${config.valueTransform}".`);
  }

  async encrypt(value) {
    let cipherAlgorithm = 'AES-256-CFB';
    let hashAlgorithm = 'sha256';
    let password = await this.prompt('Please enter the encryption password: ');
    let iv = await this.randomBytes(16);
    let salt = await this.randomBytes(8);
    let key = this.hash(`${password}${salt.toString('hex')}`, hashAlgorithm);
    let cipher = this._crypto.createCipheriv(cipherAlgorithm, Buffer.from(key, 'hex'), iv);

    return new Promise((resolve, reject) => {
      let encrypted = '';

      cipher.on('readable', () => {
        let chunk;
  
        while (null !== (chunk = cipher.read())) {
          encrypted += chunk.toString('hex');
        }
      });
      cipher.on('error', (error) => {
        reject(error);
      });
      cipher.on('end', () => {
        resolve({
          valueTransform: 'decrypt',
          salt: salt.toString('hex'),
          iv: iv.toString('hex'),
          cipherAlgorithm: cipherAlgorithm,
          hashAlgorithm: hashAlgorithm,
          value: encrypted
        });
      });
  
      cipher.write(value);
      cipher.end();
    });
  }

  hash(string, algorithm) {
    let hash = this._crypto.createHash(algorithm);

    hash.update(string);
    return hash.digest('hex');
  }

  randomBytes(length) {
    return new Promise((resolve, reject) => {
      this._crypto.randomBytes(length, (error, buffer) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(buffer);
      });
    });
  }

  prompt(question) {
    return new Promise(resolve => {
      process.stdin.resume();
      process.stdout.write(question);
      process.stdin.once('data', data => {
        resolve(data.toString().trim());
      });
    });
  }
}
