import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom does not implement the pointer capture API used by the range handles.
if (!HTMLElement.prototype.setPointerCapture) {
    Object.assign(HTMLElement.prototype, {
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
        hasPointerCapture: () => false,
    })
}

afterEach(() => {
    cleanup()
})
