import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { getRange, getRangeValues } from './range-service'

/**
 * Contract these tests expect:
 *  - getRange():       GET /api/range        -> Promise<{ min: number; max: number }>
 *  - getRangeValues(): GET /api/range-values -> Promise<number[]>   (unwraps `rangeValues`)
 *  - both reject on a non-2xx response or a body that does not match the expected shape
 *  - both reject before fetching when APP_BASE_URL is missing or not a URL
 */

const BASE_URL = 'http://localhost:8080'

function mockFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: init.ok ?? true,
        status: init.status ?? 200,
        json: async () => body,
    })
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
}

beforeEach(() => {
    vi.stubEnv('APP_BASE_URL', BASE_URL)
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
})

describe('APP_BASE_URL', () => {
    test.each([
        ['missing', undefined],
        ['empty', ''],
        ['not a URL', 'localhost'],
    ])('rejects without fetching when it is %s', async (_label, value) => {
        vi.stubEnv('APP_BASE_URL', value)
        const fetchMock = mockFetch({ min: 1, max: 100 })

        await expect(getRange()).rejects.toThrow(/APP_BASE_URL/)
        await expect(getRangeValues()).rejects.toThrow(/APP_BASE_URL/)
        expect(fetchMock).not.toHaveBeenCalled()
    })
})

describe('getRange', () => {
    test('requests the range endpoint on APP_BASE_URL', async () => {
        const fetchMock = mockFetch({ min: 1, max: 100 })

        await getRange()

        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(String(fetchMock.mock.calls[0][0])).toBe(`${BASE_URL}/api/range`)
    })

    test('resolves with min and max', async () => {
        mockFetch({ min: 1, max: 100 })

        await expect(getRange()).resolves.toEqual({ min: 1, max: 100 })
    })

    test('rejects when the server answers with an error status', async () => {
        mockFetch({}, { ok: false, status: 500 })

        await expect(getRange()).rejects.toThrow()
    })

    test('rejects when the network fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')))

        await expect(getRange()).rejects.toThrow('network down')
    })

    test.each([
        ['missing max', { min: 1 }],
        ['string values', { min: '1', max: '100' }],
        ['null body', null],
        ['min greater than max', { min: 100, max: 1 }],
    ])('rejects a malformed payload: %s', async (_label, payload) => {
        mockFetch(payload)

        await expect(getRange()).rejects.toThrow()
    })
})

describe('getRangeValues', () => {
    const rangeValues = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99]

    test('requests the range-values endpoint on APP_BASE_URL', async () => {
        const fetchMock = mockFetch({ rangeValues })

        await getRangeValues()

        expect(String(fetchMock.mock.calls[0][0])).toBe(`${BASE_URL}/api/range-values`)
    })

    test('resolves with the array of values', async () => {
        mockFetch({ rangeValues })

        await expect(getRangeValues()).resolves.toEqual(rangeValues)
    })

    test('rejects when the server answers with an error status', async () => {
        mockFetch({}, { ok: false, status: 404 })

        await expect(getRangeValues()).rejects.toThrow()
    })

    test.each([
        ['missing rangeValues', {}],
        ['rangeValues is not an array', { rangeValues: '1.99' }],
        ['non-numeric entries', { rangeValues: [1.99, 'abc'] }],
        ['empty list', { rangeValues: [] }],
        ['unsorted values', { rangeValues: [5.99, 1.99] }],
    ])('rejects a malformed payload: %s', async (_label, payload) => {
        mockFetch(payload)

        await expect(getRangeValues()).rejects.toThrow()
    })
})
