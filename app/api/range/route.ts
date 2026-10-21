import type { RangeType } from "@/lib/schemas"

export async function GET() {
    const range = { min: 1, max: 100 } satisfies RangeType
    return Response.json(range)
}
