'use client'

import { useEffect } from 'react'

type RangeErrorProps = {
    error: unknown
    retry: () => void
}

// Shared error UI for the exercise routes. The raw error stays in the console
// (server errors only carry a digest anyway) and is never shown to the user.
const RangeError = ({ error, retry }: RangeErrorProps) => {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <main className="flex flex-1 w-full flex-col items-center justify-center gap-4 px-4">
            <p role="alert" className="text-lg">
                We could not load the range. Please try again.
            </p>
            <button
                type="button"
                className="rounded-full border border-current px-5 py-2 font-medium"
                onClick={() => retry()}
            >
                Try again
            </button>
        </main>
    )
}

export default RangeError
