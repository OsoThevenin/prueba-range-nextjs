import { useState } from 'react'
import type { RangeType } from '@/lib/schemas'
import { clamp } from '@/lib/range.utils'

export type HandleName = 'min' | 'max'

// Handle positions on the internal scale: real values in normal mode,
// option indexes in fixed-values mode (so options are evenly spaced).
export type Position = { low: number, high: number }

export type UseRangeOptions = {
    min?: number,
    max?: number,
    values?: readonly number[],
    onChange?: (range: RangeType) => void
}

export type UseRangeResult = {
    isFixed: boolean,
    scale: RangeType,
    position: Position,
    toValue: (point: number) => number,
    moveHandle: (handle: HandleName, point: number) => void,
    setBound: (handle: HandleName, value: number) => void
}

export const useRange = ({ min = 0, max = 100, values, onChange }: UseRangeOptions): UseRangeResult => {
    const isFixed = values !== undefined
    // In normal mode the scale bounds are editable through the labels, so they live in state.
    const [bounds, setBounds] = useState<RangeType>({ min, max })
    const scale: RangeType = isFixed ? { min: 0, max: values.length - 1 } : bounds
    const [position, setPosition] = useState<Position>({ low: scale.min, high: scale.max })

    const toValue = (point: number) => (isFixed ? values[point] : point)

    const moveHandle = (handle: HandleName, point: number) => {
        const next: Position = handle === 'min'
            ? { ...position, low: clamp(point, scale.min, position.high) }
            : { ...position, high: clamp(point, position.low, scale.max) }

        if (next.low === position.low && next.high === position.high) return
        setPosition(next)
        onChange?.({ min: toValue(next.low), max: toValue(next.high) })
    }

    const setBound = (handle: HandleName, value: number) => {
        const next: RangeType = handle === 'min' ? { ...bounds, min: value } : { ...bounds, max: value }
        if (next.min >= next.max) return

        // The edited handle sits on its new bound; the other one stays put unless the new scale excludes it.
        const nextPosition: Position = handle === 'min'
            ? { low: value, high: clamp(position.high, next.min, next.max) }
            : { low: clamp(position.low, next.min, next.max), high: value }
        setBounds(next)
        setPosition(nextPosition)
        onChange?.({ min: nextPosition.low, max: nextPosition.high })
    }

    return { isFixed, scale, position, toValue, moveHandle, setBound }
}
