'use strict'

const test = require('tape')
const Redis = require('ioredis')
const iterateKeys = require('.')

const KEYS = new Array(5)
for (let i = 0; i < KEYS.length; i++) KEYS[i] = [i]

const scan = async (cursor, _, count) => {
	const i = parseInt(cursor)
	const keys = KEYS.slice(i, i + count)
	const end = (i + count) >= KEYS.length
	return [
		end ? '0' : '' + (i + count),
		keys,
	]
}

const readN = async (it, n = KEYS.length) => {
	const res = []
	for (let i = 0; i < KEYS.length; i++) {
		res.push((await it.next()).value)
	}
	return res.sort((a, b) => a[0] - b[0])
}

test('works', async (t) => {
	const it = iterateKeys({scan})

	const res = []
	for (let i = 0; i < KEYS.length; i++) {
		const {done, value} = await it.next()
		t.equal(done, false)
		res.push(value)
	}
	t.deepEqual(await it.next(), {done: true, value: null})
	t.deepEqual(res, KEYS)
})

test('works with an empty Redis', async (t) => {
	const scan = async () => ['0', []]
	const it = iterateKeys({scan})

	t.deepEqual(await it.next(), {done: true, value: null})
})

test('calls redis.scan properly', async (t) => {
	const _scan = async (cursor, paramName, count) => {
		t.equal(typeof cursor, 'string')
		t.ok(/^\d+$/g.test(cursor))
		t.equal(paramName, 'COUNT')
		t.equal(count, 10)
		return await scan(cursor, paramName, count)
	}
	const it = iterateKeys({scan: _scan}, {batchSize: 10})

	await it.next()
	await it.next()
	await it.next()
})

test('for-await works', async (t) => {
	const res = []
	for await (const val of iterateKeys({scan})) res.push(val)
	t.deepEqual(res, KEYS)
})

test('two iterables don\'t share state', async (t) => {
	const it1 = iterateKeys({scan})
	const it2 = it1[Symbol.asyncIterator]()

	await readN(it1, 5)
	const res2 = await readN(it2, 5)
	t.deepEqual(res2, KEYS)
})

test('two iterables share the config', async (t) => {
	const _scan = async (cursor, paramName, count) => {
		t.equal(count, 3)
		return await scan(cursor, paramName, count)
	}
	const it = iterateKeys({scan: _scan}, {batchSize: 3})
	const it2 = it[Symbol.asyncIterator]()

	await it2.next()
})

test('MATCH works', async (t) => {
	const _scan = async (_, __, ___, match, pattern) => {
		t.equal(match, 'MATCH')
		t.equal(pattern, 'foo*')
		return await scan(_, __, ___, match, pattern)
	}

	const it = iterateKeys({scan: _scan}, {match: 'foo*'})
	await it.next()
})

test('works with real Redis', async (t) => {
	const redis = new Redis(process.env.REDIS_URL || null)
	await redis.flushdb()
	for (let i = 0; i < 5; i++) {
		await redis.set('abcde'[i], `${i}${i}`)
	}

	const res = []
	const it = iterateKeys(redis, {batchSize: 2})
	for await (const key of it) res.push(key)
	t.deepEqual(res.sort(), ['a', 'b', 'c', 'd', 'e'])

	redis.quit()
})
