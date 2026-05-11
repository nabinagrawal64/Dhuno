import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthFlowPage({
    Page,
    mode,
}: {
    Page: React.ComponentType
    mode: 'login' | 'signup'
}) {
    const navigate = useNavigate()
    const rootRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const root = rootRef.current
        if (!root) return

        const onSubmit = (event: Event) => {
            event.preventDefault()
            navigate(mode === 'login' ? '/signup' : '/home')
        }

        const onClick = (event: Event) => {
            const target = event.target as HTMLElement | null
            const anchor = target?.closest('a')
            if (!anchor) return

            const label = (anchor.textContent ?? '').toLowerCase().trim()
            if (mode === 'login' && label.includes('sign up')) {
                event.preventDefault()
                navigate('/signup')
            }

            if (mode === 'signup' && (label.includes('login') || label.includes('log in'))) {
                event.preventDefault()
                navigate('/login')
            }
        }

        const forms = root.querySelectorAll('form')
        forms.forEach((form) => form.addEventListener('submit', onSubmit))
        root.addEventListener('click', onClick)

        return () => {
            forms.forEach((form) => form.removeEventListener('submit', onSubmit))
            root.removeEventListener('click', onClick)
        }
    }, [navigate, mode])

    return (
        <div ref={rootRef} className="relative min-h-screen">
            <Page />
        </div>
    )
}