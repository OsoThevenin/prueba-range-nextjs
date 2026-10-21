import { expect, test } from '@playwright/test'
import { dragHandleTo, expectHorizontallyCentered, maxHandle, minHandle, valueOf } from './range.helpers'

test.describe('Exercise 1 · normal range', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/exercise1')
        await expect(minHandle(page)).toBeVisible()
    })

    test('renders the min and max returned by the mocked service', async ({ page }) => {
        await expect(minHandle(page)).toHaveAttribute('aria-valuenow', '1')
        await expect(maxHandle(page)).toHaveAttribute('aria-valuenow', '100')
        await expect(page.getByTestId('min-label')).toHaveText('1')
        await expect(page.getByTestId('max-label')).toHaveText('100')
    })

    test('centres the range on the page', async ({ page }) => {
        await expectHorizontallyCentered(page, page.getByTestId('range-track').locator('..'))
    })

    test('moves the min handle when dragged along the track', async ({ page }) => {
        await dragHandleTo(page, minHandle(page), 0.5)

        const min = await valueOf(minHandle(page))
        expect(min).toBeGreaterThanOrEqual(45)
        expect(min).toBeLessThanOrEqual(55)
        await expect(page.getByTestId('min-label')).toHaveText(String(min))
    })

    test('does not let the handles cross each other', async ({ page }) => {
        await dragHandleTo(page, maxHandle(page), 0.3)
        const max = await valueOf(maxHandle(page))

        await dragHandleTo(page, minHandle(page), 0.9)

        await expect(minHandle(page)).toHaveAttribute('aria-valuenow', String(max))
    })

    test('sets a new minimum and maximum by editing the labels', async ({ page }) => {
        await page.getByTestId('min-label').click()
        await page.getByRole('spinbutton').fill('25')
        await page.keyboard.press('Enter')
        await expect(minHandle(page)).toHaveAttribute('aria-valuenow', '25')

        await page.getByTestId('max-label').click()
        await page.getByRole('spinbutton').fill('500')
        await page.keyboard.press('Enter')
        await expect(maxHandle(page)).toHaveAttribute('aria-valuenow', '500')
    })

    test('moves a focused handle with the arrow keys', async ({ page }) => {
        await maxHandle(page).focus()
        await page.keyboard.press('ArrowLeft')

        await expect(maxHandle(page)).toHaveAttribute('aria-valuenow', '99')
    })
})
