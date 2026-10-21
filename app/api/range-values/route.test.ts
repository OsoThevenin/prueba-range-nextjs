import { describe, expect, test } from 'vitest'
import { GET } from './route'

describe('GET /api/range-values', () => {
    test('responds with HTTP 200', async () => {
        const response = await GET()

        expect(response.status).toBe(200)
    })

    test('returns the fixed values for exercise 2', async () => {
        const response = await GET()

        expect(await response.json()).toEqual({
            rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99],
        })
    })

    test('returns a JSON content type', async () => {
        const response = await GET()

        expect(response.headers.get('content-type')).toMatch(/application\/json/)
    })

    test('returns the values sorted ascending', async () => {
        const { rangeValues } = await (await GET()).json()

        expect(rangeValues).toEqual([...rangeValues].sort((a: number, b: number) => a - b))
    })
})
