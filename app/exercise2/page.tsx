import { Suspense } from 'react'
import Range from '@/components/range'
import { getRangeValues } from '@/services/range-service'

const FixedValuesRange = async () => {
    const values = await getRangeValues()
    return <Range values={values} />
}

const Exercise2 = () => {
    return (
        <main className="flex flex-1 w-full flex-col items-center justify-center gap-8 px-4">
            <h1 className="text-2xl font-semibold">Exercise 2 · Fixed values range</h1>
            <Suspense fallback={<p>Loading range…</p>}>
                <FixedValuesRange />
            </Suspense>
        </main>
    )
}

export default Exercise2
