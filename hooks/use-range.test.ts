import { describe, expect, test, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useRange } from './use-range'

describe('useRange in normal mode', () => {
    const setup = (onChange = vi.fn()) => ({
        onChange,
        ...renderHook(() => useRange({ min: 1, max: 100, onChange })),
    })

    test('starts with the handles on the bounds', () => {
        const { result } = setup()

        expect(result.current.isFixed).toBe(false)
        expect(result.current.scale).toEqual({ min: 1, max: 100 })
        expect(result.current.position).toEqual({ low: 1, high: 100 })
    })

    test('moves a handle and reports the new range', () => {
        const { result, onChange } = setup()

        act(() => result.current.moveHandle('min', 30))

        expect(result.current.position).toEqual({ low: 30, high: 100 })
        expect(onChange).toHaveBeenCalledWith({ min: 30, max: 100 })
    })

    test('does not let the handles cross', () => {
        const { result } = setup()

        act(() => result.current.moveHandle('max', 40))
        act(() => result.current.moveHandle('min', 90))

        expect(result.current.position).toEqual({ low: 40, high: 40 })
    })

    test('does not report a move that changes nothing', () => {
        const { result, onChange } = setup()

        act(() => result.current.moveHandle('min', -10))

        expect(onChange).not.toHaveBeenCalled()
    })

    test('editing a bound moves the scale and its handle', () => {
        const { result, onChange } = setup()

        act(() => result.current.setBound('max', 50))

        expect(result.current.scale).toEqual({ min: 1, max: 50 })
        expect(result.current.position).toEqual({ low: 1, high: 50 })
        expect(onChange).toHaveBeenCalledWith({ min: 1, max: 50 })
    })

    test('editing a bound pulls the other handle inside the new scale', () => {
        const { result } = setup()
        act(() => result.current.moveHandle('max', 80))

        act(() => result.current.setBound('min', 90))

        expect(result.current.position).toEqual({ low: 90, high: 90 })
    })

    test('ignores a bound that would leave an empty scale', () => {
        const { result, onChange } = setup()

        act(() => result.current.setBound('min', 100))

        expect(result.current.scale).toEqual({ min: 1, max: 100 })
        expect(onChange).not.toHaveBeenCalled()
    })
})

describe('useRange in fixed-values mode', () => {
    const values = [1.99, 5.99, 10.99, 30.99]

    test('uses option indexes as the scale', () => {
        const { result } = renderHook(() => useRange({ values }))

        expect(result.current.isFixed).toBe(true)
        expect(result.current.scale).toEqual({ min: 0, max: 3 })
        expect(result.current.position).toEqual({ low: 0, high: 3 })
    })

    test('maps scale points to the real values', () => {
        const { result } = renderHook(() => useRange({ values }))

        expect(result.current.toValue(2)).toBe(10.99)
    })

    test('reports real values, not indexes, on change', () => {
        const onChange = vi.fn()
        const { result } = renderHook(() => useRange({ values, onChange }))

        act(() => result.current.moveHandle('max', 1))

        expect(onChange).toHaveBeenCalledWith({ min: 1.99, max: 5.99 })
    })
})
