'use client'

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import RangeLabel from './range-label'
import { positionToValue, valueToPercent } from '@/lib/range.utils'
import { useBodyCursor } from '@/hooks/use-body-cursor'
import { useRange, type HandleName, type UseRangeOptions } from '@/hooks/use-range'
import './range.css'

type RangeProps = UseRangeOptions

const KEY_STEPS: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }
const DRAGGING_CURSOR = 'grabbing'
const currencyFormat = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

const Range = (props: RangeProps) => {
    const { isFixed, scale, position, toValue, moveHandle, setBound } = useRange(props)
    const [dragging, setDragging] = useState<HandleName | null>(null)
    const trackRef = useRef<HTMLDivElement>(null)

    useBodyCursor(dragging ? DRAGGING_CURSOR : null)

    const format = (point: number) => (isFixed ? currencyFormat.format(toValue(point)) : String(point))

    const pointerToScale = (clientX: number) => {
        const rect = trackRef.current?.getBoundingClientRect()
        if (!rect || rect.width === 0) return null
        return Math.round(positionToValue(clientX, rect, scale.min, scale.max))
    }

    const handlePointerDown = (handle: HandleName) => (event: PointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        setDragging(handle)
    }

    const handlePointerMove = (handle: HandleName) => (event: PointerEvent<HTMLDivElement>) => {
        if (dragging !== handle) return
        const point = pointerToScale(event.clientX)
        if (point !== null) moveHandle(handle, point)
    }

    const handleKeyDown = (handle: HandleName) => (event: KeyboardEvent<HTMLDivElement>) => {
        const step = KEY_STEPS[event.key]
        if (step === undefined) return
        event.preventDefault()
        moveHandle(handle, (handle === 'min' ? position.low : position.high) + step)
    }

    const renderHandle = (handle: HandleName) => {
        const point = handle === 'min' ? position.low : position.high
        const lowest = handle === 'min' ? scale.min : position.low
        const highest = handle === 'min' ? position.high : scale.max

        return (
            <div
                role="slider"
                tabIndex={0}
                aria-label={handle === 'min' ? 'Minimum' : 'Maximum'}
                aria-valuemin={toValue(lowest)}
                aria-valuemax={toValue(highest)}
                aria-valuenow={toValue(point)}
                aria-valuetext={format(point)}
                data-dragging={dragging === handle}
                className="range__handle"
                style={{ left: `${valueToPercent(point, scale.min, scale.max)}%` }}
                onPointerDown={handlePointerDown(handle)}
                onPointerMove={handlePointerMove(handle)}
                onPointerUp={() => setDragging(null)}
                onPointerCancel={() => setDragging(null)}
                onKeyDown={handleKeyDown(handle)}
            />
        )
    }

    const lowPercent = valueToPercent(position.low, scale.min, scale.max)
    const highPercent = valueToPercent(position.high, scale.min, scale.max)

    return (
        <div className="range">
            <RangeLabel
                testId="min-label"
                className="range__label range__label--min"
                name="minimum"
                text={format(position.low)}
                value={position.low}
                isEditable={!isFixed}
                onCommit={(value) => setBound('min', value)}
            />
            <div ref={trackRef} data-testid="range-track" className="range__track">
                <div
                    className="range__fill"
                    style={{ left: `${lowPercent}%`, width: `${highPercent - lowPercent}%` }}
                />
                {renderHandle('min')}
                {renderHandle('max')}
            </div>
            <RangeLabel
                testId="max-label"
                className="range__label"
                name="maximum"
                text={format(position.high)}
                value={position.high}
                isEditable={!isFixed}
                onCommit={(value) => setBound('max', value)}
            />
        </div>
    )
}

export default Range
