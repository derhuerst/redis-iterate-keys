'use strict'

const keysAsyncIterator = (redis, chunkSize = 20) => {
	let pCursor = Promise.resolve('0')
	let bufferedKeys = []
	let end = false

	const iterate = async () => {
		if (bufferedKeys.length === 0) {
			if (end) return {done: true, value: null}

			const op = pCursor
			.then(cursor => redis.scan(cursor, 'COUNT', chunkSize))
			// set pCursor immediately, `await` Promise later
			pCursor = op.then(scanRes => scanRes[0])

			const [cursor, newBufferedKeys] = await op
			bufferedKeys = bufferedKeys.concat(newBufferedKeys)

			if (bufferedKeys.length === 0) {
				// stop immediately
				return {done: true, value: null}
			}
			end = cursor === '0' // stop in next iteration
		}
		return {done: false, value: bufferedKeys.shift()}
	}

	return {
		next: iterate,
		// support async iterable API
		[Symbol.asyncIterator]: () => keysAsyncIterator(redis, chunkSize),
	}
}

module.exports = keysAsyncIterator
