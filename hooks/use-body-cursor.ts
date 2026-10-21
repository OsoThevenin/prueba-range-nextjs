import { useEffect } from 'react'

// Overrides the page cursor while `cursor` is set, e.g. to keep "grabbing" when a drag
// leaves the element that started it. Restores whatever cursor was there before.
export const useBodyCursor = (cursor: string | null): void => {
    useEffect(() => {
        if (cursor === null) return
        const previousCursor = document.body.style.cursor
        document.body.style.cursor = cursor
        return () => {
            document.body.style.cursor = previousCursor
        }
    }, [cursor])
}
