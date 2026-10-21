import { z } from 'zod'
import { rangeSchema, rangeValuesSchema, type RangeType } from '@/lib/schemas'

const RANGE_PATH = '/api/range'
const RANGE_VALUES_PATH = '/api/range-values'

const baseUrlSchema = z.url({ protocol: /^https?$/ })

const getBaseUrl = (): string => {
    const result = baseUrlSchema.safeParse(process.env.APP_BASE_URL)
    if (!result.success) {
        throw new Error('APP_BASE_URL must be an http(s) URL, e.g. http://localhost:8080')
    }
    return result.data
}

const fetchValidated = async <T>(path: string, schema: z.ZodType<T>): Promise<T> => {
    const url = new URL(path, getBaseUrl())
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status}`)
    }

    const result = schema.safeParse(await response.json())
    if (!result.success) {
        throw new Error(`Invalid payload from ${url}: ${z.prettifyError(result.error)}`)
    }
    return result.data
}

export const getRange = (): Promise<RangeType> => fetchValidated(RANGE_PATH, rangeSchema)

export const getRangeValues = async (): Promise<number[]> => {
    const { rangeValues } = await fetchValidated(RANGE_VALUES_PATH, rangeValuesSchema)
    return rangeValues
}
