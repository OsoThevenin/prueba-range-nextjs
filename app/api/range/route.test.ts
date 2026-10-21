import { describe, expect, test } from 'vitest'
import { GET } from './route'

describe('GET /api/range', () => {
    test('responds with HTTP 200', async () => {
        const response = await GET()

        expect(response.status).toBe(200)
    })

    test('returns the min and max for exercise 1', async () => {
        const response = await GET()

        expect(await response.json()).toEqual({ min: 1, max: 100 })
    })

    test('returns a JSON content type', async () => {
        const response = await GET()

        expect(response.headers.get('content-type')).toMatch(/application\/json/)
    })

    test('returns a min that is lower than the max', async () => {
        const { min, max } = await (await GET()).json()

        expect(min).toBeLessThan(max)
    })
})
