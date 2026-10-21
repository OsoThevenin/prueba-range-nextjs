import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import RangeError from './range-error'

describe('<RangeError />', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    test('shows a friendly message', () => {
        render(<RangeError error={new Error('boom')} retry={vi.fn()} />)

        expect(screen.getByRole('alert')).toHaveTextContent(/could not load the range/i)
    })

    test('does not leak the error message to the user', () => {
        render(<RangeError error={new Error('secret detail')} retry={vi.fn()} />)

        expect(screen.queryByText(/secret detail/)).not.toBeInTheDocument()
    })

    test('retries when the user clicks the button', async () => {
        const retry = vi.fn()
        const user = userEvent.setup()
        render(<RangeError error={new Error('boom')} retry={retry} />)

        await user.click(screen.getByRole('button', { name: /try again/i }))

        expect(retry).toHaveBeenCalledOnce()
    })
})
