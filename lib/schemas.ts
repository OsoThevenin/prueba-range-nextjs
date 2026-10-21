import { z } from 'zod'

// z.number() already rejects NaN and ±Infinity.
export const rangeSchema = z
    .object({ min: z.number(), max: z.number() })
    .refine(({ min, max }) => min < max, { message: 'min must be lower than max' })

const isAscending = (values: number[]) =>
    values.every((value, index) => index === 0 || values[index - 1] < value)

export const rangeValuesSchema = z.object({
    rangeValues: z
        .array(z.number())
        .min(1)
        .refine(isAscending, { message: 'rangeValues must be in strictly ascending order' }),
})

export type RangeType = z.infer<typeof rangeSchema>

export type RangeValuesType = z.infer<typeof rangeValuesSchema>
