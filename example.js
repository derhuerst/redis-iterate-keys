'use strict'

const Redis = require('ioredis')
const iterateKeys = require('.')

const redis = new Redis()

;(async () => {
	for await (const key of iterateKeys(redis)) {
		console.log(key)
	}
	redis.quit()
})()
.catch((err) => {
	console.error(err)
	process.exit(1)
})
