import { expect, type Locator, type Page } from '@playwright/test'

export const minHandle = (page: Page): Locator => page.getByRole('slider', { name: 'Minimum' })
export const maxHandle = (page: Page): Locator => page.getByRole('slider', { name: 'Maximum' })

export const valueOf = async (handle: Locator): Promise<number> =>
    Number(await handle.getAttribute('aria-valuenow'))

// Drags a handle with the real mouse to a point of the track, given as a 0..1 ratio of its width.
export const dragHandleTo = async (page: Page, handle: Locator, ratio: number): Promise<void> => {
    const track = await page.getByTestId('range-track').boundingBox()
    const handleBox = await handle.boundingBox()
    expect(track).not.toBeNull()
    expect(handleBox).not.toBeNull()
    if (!track || !handleBox) return

    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(track.x + track.width * ratio, track.y + track.height / 2, { steps: 10 })
    await page.mouse.up()
}

// Asserts the element sits in the horizontal centre of the viewport.
export const expectHorizontallyCentered = async (page: Page, element: Locator): Promise<void> => {
    const box = await element.boundingBox()
    const viewport = page.viewportSize()
    expect(box).not.toBeNull()
    expect(viewport).not.toBeNull()
    if (!box || !viewport) return

    const elementCenter = box.x + box.width / 2
    expect(Math.abs(elementCenter - viewport.width / 2)).toBeLessThanOrEqual(2)
}
