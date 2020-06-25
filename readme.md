# redis-iterate-keys

**Iterate over keys in [Redis](https://redis.io/)**, using the [`SCAN` command](https://redis.io/commands/scan).

[![npm version](https://img.shields.io/npm/v/redis-iterate-keys.svg)](https://www.npmjs.com/package/redis-iterate-keys)
[![build status](https://api.travis-ci.org/derhuerst/redis-iterate-keys.svg?branch=master)](https://travis-ci.org/derhuerst/redis-iterate-keys)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/redis-iterate-keys.svg)
![minimum Node.js version](https://img.shields.io/node/v/redis-iterate-keys.svg)
[![chat with me on Gitter](https://img.shields.io/badge/chat%20with%20me-on%20gitter-512e92.svg)](https://gitter.im/derhuerst)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)


## Installation

```shell
npm install redis-iterate-keys
```


## Usage

```js
const Redis = require('ioredis')
const iterateKeys = require('redis-iterate-keys')

const redis = new Redis()
for await (const key of iterateKeys(redis)) {
	console.log(key)
}
redis.quit()
```


## Contributing

If you have a question or need support using `redis-iterate-keys`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, use [the issues page](https://github.com/derhuerst/redis-iterate-keys/issues).
