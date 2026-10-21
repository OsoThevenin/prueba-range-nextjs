'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

type RangeLabelProps = {
    testId: string
    className: string
    name: string
    text: string
    value: number
    isEditable: boolean
    onCommit: (value: number) => void
}

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1)

const RangeLabel = ({ testId, className, name, text, value, isEditable, onCommit }: RangeLabelProps) => {
    const [draft, setDraft] = useState<string | null>(null)
    const isClosingRef = useRef(false)
    // Only keyboard closes (Enter/Escape) give focus back; a blur already moved it elsewhere.
    const shouldRefocusRef = useRef(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (draft !== null || !shouldRefocusRef.current) return
        shouldRefocusRef.current = false
        buttonRef.current?.focus()
    }, [draft])

    if (!isEditable) {
        return <span data-testid={testId} className={className}>{text}</span>
    }

    if (draft === null) {
        const startEditing = () => {
            isClosingRef.current = false
            setDraft(String(value))
        }

        return (
            <button
                ref={buttonRef}
                type="button"
                data-testid={testId}
                aria-label={`Edit ${name} (${text})`}
                className={className}
                onClick={startEditing}
            >
                {text}
            </button>
        )
    }

    const close = () => {
        isClosingRef.current = true
        setDraft(null)
    }

    const commit = () => {
        const parsed = Number(draft)
        if (draft.trim() !== '' && Number.isFinite(parsed)) onCommit(parsed)
        close()
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter' && event.key !== 'Escape') return
        // Without this, the Enter keypress lands on the refocused button and reopens the editor.
        event.preventDefault()
        shouldRefocusRef.current = true
        if (event.key === 'Enter') commit()
        else close()
    }

    const handleBlur = () => {
        if (!isClosingRef.current) commit()
    }

    return (
        <input
            type="number"
            autoFocus
            aria-label={`${capitalize(name)} value`}
            className={className}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
        />
    )
}

export default RangeLabel
