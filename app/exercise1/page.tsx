import { Suspense } from 'react'
import Range from '@/components/range'
import { getRange } from '@/services/range-service'

const NormalRange = async () => {
    const { min, max } = await getRange()
    return <Range min={min} max={max} />
}

const Exercise1 = () => {
    return (
        <main className="flex flex-1 w-full flex-col items-center justify-center gap-8 px-4">
            <h1 className="text-2xl font-semibold">Exercise 1 · Normal range</h1>
            <Suspense fallback={<p>Loading range…</p>}>
                <NormalRange />
            </Suspense>
        </main>
    )
}

export default Exercise1
