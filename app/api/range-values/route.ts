import type { RangeValuesType } from "@/lib/schemas"

export async function GET() {
    const rangeValues = {
        rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99]
    } satisfies RangeValuesType
    return Response.json(rangeValues)
}
