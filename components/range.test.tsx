import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import Range from './range'

/**
 * Component contract these tests expect:
 *  - <Range min max onChange? />            normal mode
 *  - <Range values onChange? />             fixed-values mode (min/max derived from `values`)
 *  - onChange receives { min, max }
 *  - track:    data-testid="range-track"
 *  - handles:  role="slider", aria-label "Minimum" / "Maximum", aria-valuenow
 *  - labels:   data-testid="min-label" / "max-label"
 *  - editable labels (normal mode only): clicking one renders a number input
 *    (role "spinbutton"), committed on Enter/blur, cancelled on Escape
 *  - arrow keys on a focused handle move it by one step (1 in normal mode, one option in fixed mode)
 */

function mockTrackRect(width: number): void {
    const track = screen.getByTestId('range-track')
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        right: width,
        width,
        top: 0,
        bottom: 10,
        height: 10,
        x: 0,
        y: 0,
        toJSON: () => ({}),
    })
}

function drag(handle: HTMLElement, toClientX: number): void {
    fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientX: toClientX, pointerId: 1 })
    fireEvent.pointerUp(handle, { clientX: toClientX, pointerId: 1 })
}

const minHandle = () => screen.getByRole('slider', { name: /min/i })
const maxHandle = () => screen.getByRole('slider', { name: /max/i })

async function editLabel(
    label: 'min-label' | 'max-label',
    text: string,
    commit = '{Enter}',
): Promise<void> {
    const user = userEvent.setup()
    await user.click(screen.getByTestId(label))
    await user.clear(screen.getByRole('spinbutton'))
    await user.type(screen.getByRole('spinbutton'), `${text}${commit}`)
}

describe('<Range /> normal mode', () => {
    const onChange = vi.fn()

    beforeEach(() => {
        onChange.mockClear()
        render(<Range min={0} max={100} onChange={onChange} />)
        mockTrackRect(100)
    })

    describe('rendering', () => {
        test('renders two handles', () => {
            expect(screen.getAllByRole('slider')).toHaveLength(2)
        })

        test('starts with the handles on the extremes', () => {
            expect(minHandle()).toHaveAttribute('aria-valuenow', '0')
            expect(maxHandle()).toHaveAttribute('aria-valuenow', '100')
        })

        test('shows the min and max values as labels', () => {
            expect(screen.getByTestId('min-label')).toHaveTextContent('0')
            expect(screen.getByTestId('max-label')).toHaveTextContent('100')
        })

        test('does not render a native input range', () => {
            expect(document.querySelector('input[type="range"]')).toBeNull()
        })
    })

    describe('dragging', () => {
        test('moves the min handle to the pointer position', () => {
            drag(minHandle(), 30)

            expect(minHandle()).toHaveAttribute('aria-valuenow', '30')
            expect(onChange).toHaveBeenLastCalledWith({ min: 30, max: 100 })
        })

        test('moves the max handle to the pointer position', () => {
            drag(maxHandle(), 70)

            expect(maxHandle()).toHaveAttribute('aria-valuenow', '70')
            expect(onChange).toHaveBeenLastCalledWith({ min: 0, max: 70 })
        })

        test('does not move the handle when the pointer is not pressed', () => {
            fireEvent.pointerMove(minHandle(), { clientX: 40, pointerId: 1 })

            expect(minHandle()).toHaveAttribute('aria-valuenow', '0')
            expect(onChange).not.toHaveBeenCalled()
        })

        test('stops following the pointer after release', () => {
            drag(minHandle(), 30)
            fireEvent.pointerMove(minHandle(), { clientX: 60, pointerId: 1 })

            expect(minHandle()).toHaveAttribute('aria-valuenow', '30')
        })

        test('never lets the min handle go below the range minimum', () => {
            drag(minHandle(), -50)

            expect(minHandle()).toHaveAttribute('aria-valuenow', '0')
        })

        test('never lets the max handle go above the range maximum', () => {
            drag(maxHandle(), 500)

            expect(maxHandle()).toHaveAttribute('aria-valuenow', '100')
        })

        test('does not let the min handle cross the max handle', () => {
            drag(maxHandle(), 50)
            drag(minHandle(), 90)

            expect(minHandle()).toHaveAttribute('aria-valuenow', '50')
            expect(maxHandle()).toHaveAttribute('aria-valuenow', '50')
        })

        test('does not let the max handle cross the min handle', () => {
            drag(minHandle(), 60)
            drag(maxHandle(), 10)

            expect(maxHandle()).toHaveAttribute('aria-valuenow', '60')
            expect(minHandle()).toHaveAttribute('aria-valuenow', '60')
        })
    })

    describe('cursor feedback', () => {
        test('flags the handle as dragging while the pointer is pressed', () => {
            fireEvent.pointerDown(minHandle(), { clientX: 0, pointerId: 1 })

            expect(minHandle()).toHaveAttribute('data-dragging', 'true')
        })

        test('clears the dragging flag on release', () => {
            drag(minHandle(), 20)

            expect(minHandle()).not.toHaveAttribute('data-dragging', 'true')
        })
    })

    describe('keyboard', () => {
        test('ArrowRight increases the focused handle by one step', async () => {
            const user = userEvent.setup()
            minHandle().focus()

            await user.keyboard('{ArrowRight}')

            expect(minHandle()).toHaveAttribute('aria-valuenow', '1')
        })

        test('ArrowLeft decreases the focused handle by one step', async () => {
            const user = userEvent.setup()
            maxHandle().focus()

            await user.keyboard('{ArrowLeft}')

            expect(maxHandle()).toHaveAttribute('aria-valuenow', '99')
        })

        test('keyboard cannot push a handle past its limits', async () => {
            const user = userEvent.setup()
            minHandle().focus()

            await user.keyboard('{ArrowLeft}')

            expect(minHandle()).toHaveAttribute('aria-valuenow', '0')
        })
    })
})

describe('<Range /> editable labels', () => {
    const onChange = vi.fn()

    beforeEach(() => {
        onChange.mockClear()
        render(<Range min={1} max={100} onChange={onChange} />)
    })

    test('clicking the min label turns it into an input', async () => {
        const user = userEvent.setup()

        await user.click(screen.getByTestId('min-label'))

        expect(screen.getByRole('spinbutton')).toHaveValue(1)
    })

    test('labels have accessible names that include their value', () => {
        expect(screen.getByRole('button', { name: 'Edit minimum (1)' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Edit maximum (100)' })).toBeInTheDocument()
    })

    test('the input has an accessible name', async () => {
        const user = userEvent.setup()

        await user.click(screen.getByTestId('max-label'))

        expect(screen.getByRole('spinbutton', { name: 'Maximum value' })).toBeInTheDocument()
    })

    test.each(['{Enter}', '{Escape}'])('returns focus to the label after %s', async (key) => {
        const user = userEvent.setup()
        await user.click(screen.getByTestId('min-label'))

        await user.keyboard(key)

        expect(screen.getByTestId('min-label')).toHaveFocus()
    })

    test('does not steal focus back when the input loses focus', async () => {
        const user = userEvent.setup()
        await user.click(screen.getByTestId('min-label'))

        await user.click(screen.getByTestId('max-label'))

        expect(screen.getByTestId('min-label')).not.toHaveFocus()
    })

    test('typing a valid min value and pressing Enter updates the handle', async () => {
        await editLabel('min-label', '25')

        expect(minHandle()).toHaveAttribute('aria-valuenow', '25')
        expect(onChange).toHaveBeenLastCalledWith({ min: 25, max: 100 })
    })

    test('typing a valid max value and pressing Enter updates the handle', async () => {
        await editLabel('max-label', '80')

        expect(maxHandle()).toHaveAttribute('aria-valuenow', '80')
    })

    test('committing on blur also updates the value', async () => {
        const user = userEvent.setup()
        await editLabel('min-label', '40', '')

        await user.tab()

        expect(minHandle()).toHaveAttribute('aria-valuenow', '40')
    })

    test('a min value below the current minimum extends the range', async () => {
        await editLabel('min-label', '-20')

        expect(minHandle()).toHaveAttribute('aria-valuenow', '-20')
        expect(minHandle()).toHaveAttribute('aria-valuemin', '-20')
    })

    test('a max value above the current maximum extends the range beyond 100', async () => {
        await editLabel('max-label', '999')

        expect(maxHandle()).toHaveAttribute('aria-valuenow', '999')
        expect(maxHandle()).toHaveAttribute('aria-valuemax', '999')
        expect(onChange).toHaveBeenLastCalledWith({ min: 1, max: 999 })
    })

    test('a smaller max shrinks the scale', async () => {
        await editLabel('max-label', '50')

        expect(maxHandle()).toHaveAttribute('aria-valuenow', '50')
        expect(maxHandle()).toHaveAttribute('aria-valuemax', '50')
        expect(onChange).toHaveBeenLastCalledWith({ min: 1, max: 50 })
    })

    test('ignores a min value that is not below the maximum', async () => {
        await editLabel('min-label', '100')

        expect(minHandle()).toHaveAttribute('aria-valuenow', '1')
    })

    test('ignores a max value that is not above the minimum', async () => {
        await editLabel('max-label', '1')

        expect(maxHandle()).toHaveAttribute('aria-valuenow', '100')
    })

    test('dragging uses the new scale after editing a label', async () => {
        await editLabel('max-label', '200')

        expect(maxHandle()).toHaveAttribute('aria-valuemax', '200')
        expect(maxHandle().style.left).toBe('100%')
    })

    test('Escape cancels the edit and keeps the previous value', async () => {
        await editLabel('min-label', '30', '{Escape}')

        expect(minHandle()).toHaveAttribute('aria-valuenow', '1')
        expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    })

    test('an empty input keeps the previous value', async () => {
        const user = userEvent.setup()
        await user.click(screen.getByTestId('min-label'))

        await user.clear(screen.getByRole('spinbutton'))
        await user.keyboard('{Enter}')

        expect(minHandle()).toHaveAttribute('aria-valuenow', '1')
    })

    test('returns to a plain label after committing', async () => {
        const user = userEvent.setup()
        await user.click(screen.getByTestId('min-label'))

        await user.keyboard('{Enter}')

        expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
        expect(screen.getByTestId('min-label')).toBeInTheDocument()
    })
})

describe('<Range /> fixed values mode', () => {
    const values = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99]
    const onChange = vi.fn()

    beforeEach(() => {
        onChange.mockClear()
        render(<Range values={values} onChange={onChange} />)
        // 6 options over 500px => option i sits at x = i * 100
        mockTrackRect(500)
    })

    test('starts on the first and last options', () => {
        expect(minHandle()).toHaveAttribute('aria-valuenow', '1.99')
        expect(maxHandle()).toHaveAttribute('aria-valuenow', '70.99')
    })

    test('labels show the values as currency', () => {
        expect(screen.getByTestId('min-label')).toHaveTextContent(/1[.,]99/)
        expect(screen.getByTestId('max-label')).toHaveTextContent(/70[.,]99/)
    })

    test('labels are read-only: clicking them does not open an input', async () => {
        const user = userEvent.setup()

        await user.click(screen.getByTestId('min-label'))
        await user.click(screen.getByTestId('max-label'))

        expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    test('snaps the dragged handle to the nearest option', () => {
        drag(maxHandle(), 290)

        expect(maxHandle()).toHaveAttribute('aria-valuenow', '30.99')
        expect(onChange).toHaveBeenLastCalledWith({ min: 1.99, max: 30.99 })
    })

    test('only ever emits values from the provided list', () => {
        drag(minHandle(), 137)
        drag(maxHandle(), 333)

        for (const [{ min, max }] of onChange.mock.calls) {
            expect(values).toContain(min)
            expect(values).toContain(max)
        }
    })

    test('does not let the min handle cross the max handle', () => {
        drag(maxHandle(), 200)
        drag(minHandle(), 450)

        expect(minHandle()).toHaveAttribute('aria-valuenow', '10.99')
        expect(maxHandle()).toHaveAttribute('aria-valuenow', '10.99')
    })

    test('does not let the max handle cross the min handle', () => {
        drag(minHandle(), 300)
        drag(maxHandle(), 0)

        expect(maxHandle()).toHaveAttribute('aria-valuenow', '30.99')
    })

    test('ArrowRight moves to the next option', async () => {
        const user = userEvent.setup()
        minHandle().focus()

        await user.keyboard('{ArrowRight}')

        expect(minHandle()).toHaveAttribute('aria-valuenow', '5.99')
    })
})
