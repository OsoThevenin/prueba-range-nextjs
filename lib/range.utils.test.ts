import { describe, expect, test } from 'vitest'
import { clamp, positionToValue, valueToPercent } from './range.utils'

describe('clamp', () => {
    test('returns the value when it is inside the bounds', () => {
        expect(clamp(50, 1, 100)).toBe(50)
    })

    test('returns min when the value is below the lower bound', () => {
        expect(clamp(-5, 1, 100)).toBe(1)
    })

    test('returns max when the value is above the upper bound', () => {
        expect(clamp(500, 1, 100)).toBe(100)
    })

    test('keeps values that sit exactly on a bound', () => {
        expect(clamp(1, 1, 100)).toBe(1)
        expect(clamp(100, 1, 100)).toBe(100)
    })
})

describe('valueToPercent', () => {
    test('maps min to 0 and max to 100', () => {
        expect(valueToPercent(1, 1, 100)).toBe(0)
        expect(valueToPercent(100, 1, 100)).toBe(100)
    })

    test('maps a middle value proportionally', () => {
        expect(valueToPercent(50, 0, 100)).toBe(50)
        expect(valueToPercent(15, 10, 20)).toBe(50)
    })

    test('returns 0 instead of NaN when min equals max', () => {
        expect(valueToPercent(5, 5, 5)).toBe(0)
    })
})

describe('positionToValue', () => {
    const rect = { left: 100, width: 200 }

    test('maps the left edge of the track to min', () => {
        expect(positionToValue(100, rect, 0, 100)).toBe(0)
    })

    test('maps the right edge of the track to max', () => {
        expect(positionToValue(300, rect, 0, 100)).toBe(100)
    })

    test('maps the middle of the track to the middle value', () => {
        expect(positionToValue(200, rect, 0, 100)).toBe(50)
    })

    test('clamps positions left of the track to min', () => {
        expect(positionToValue(-40, rect, 10, 90)).toBe(10)
    })

    test('clamps positions right of the track to max', () => {
        expect(positionToValue(9999, rect, 10, 90)).toBe(90)
    })

    test('is the inverse of valueToPercent', () => {
        const percent = valueToPercent(37, 1, 100)
        const clientX = rect.left + (percent / 100) * rect.width

        expect(positionToValue(clientX, rect, 1, 100)).toBeCloseTo(37)
    })
})
