export type RectangleType = {
    left: number,
    width: number
}

export const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max)
}

export const valueToPercent = (value: number, min: number, max: number) => {
    if (max === min) return 0
    return ((value - min) / (max - min)) * 100
}

export const positionToValue = (clientX: number, trackRect: RectangleType, min: number, max: number) => {
    const ratio = clamp((clientX - trackRect.left) / trackRect.width, 0, 1)

    return min + ratio * (max - min)
}
