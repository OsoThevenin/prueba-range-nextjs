import { afterEach, describe, expect, test } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBodyCursor } from './use-body-cursor'

afterEach(() => {
    document.body.style.cursor = ''
})

describe('useBodyCursor', () => {
    test('leaves the body cursor alone when no cursor is given', () => {
        document.body.style.cursor = 'auto'

        renderHook(() => useBodyCursor(null))

        expect(document.body.style.cursor).toBe('auto')
    })

    test('applies the cursor to the body while active', () => {
        renderHook(() => useBodyCursor('grabbing'))

        expect(document.body.style.cursor).toBe('grabbing')
    })

    test('restores the previous cursor when it becomes inactive', () => {
        document.body.style.cursor = 'auto'
        const { rerender } = renderHook(({ cursor }) => useBodyCursor(cursor), {
            initialProps: { cursor: 'grabbing' as string | null },
        })

        rerender({ cursor: null })

        expect(document.body.style.cursor).toBe('auto')
    })

    test('restores the previous cursor on unmount', () => {
        document.body.style.cursor = 'auto'
        const { unmount } = renderHook(() => useBodyCursor('grabbing'))

        unmount()

        expect(document.body.style.cursor).toBe('auto')
    })
})
