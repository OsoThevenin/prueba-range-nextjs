import { expect, test } from '@playwright/test'
import { dragHandleTo, expectHorizontallyCentered, maxHandle, minHandle, valueOf } from './range.helpers'

const RANGE_VALUES = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99]

test.describe('Exercise 2 · fixed values range', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/exercise2')
        await expect(minHandle(page)).toBeVisible()
    })

    test('renders the first and last values from the mocked service as currency', async ({ page }) => {
        await expect(minHandle(page)).toHaveAttribute('aria-valuenow', '1.99')
        await expect(maxHandle(page)).toHaveAttribute('aria-valuenow', '70.99')
        await expect(page.getByTestId('min-label')).toHaveText(/1,99\s€/)
        await expect(page.getByTestId('max-label')).toHaveText(/70,99\s€/)
    })

    test('centres the range on the page', async ({ page }) => {
        await expectHorizontallyCentered(page, page.getByTestId('range-track').locator('..'))
    })

    test('keeps the currency labels read-only', async ({ page }) => {
        await page.getByTestId('min-label').click()

        await expect(page.getByRole('spinbutton')).toHaveCount(0)
        await expect(page.getByRole('button', { name: /€/ })).toHaveCount(0)
    })

    test('snaps a dragged handle to one of the fixed values', async ({ page }) => {
        await dragHandleTo(page, minHandle(page), 0.45)

        const min = await valueOf(minHandle(page))
        expect(RANGE_VALUES).toContain(min)
        expect(min).toBeGreaterThan(RANGE_VALUES[0])
    })

    test('does not let the handles cross each other', async ({ page }) => {
        await dragHandleTo(page, minHandle(page), 1)

        await expect(minHandle(page)).toHaveAttribute('aria-valuenow', '70.99')
        await expect(maxHandle(page)).toHaveAttribute('aria-valuenow', '70.99')
    })
})
