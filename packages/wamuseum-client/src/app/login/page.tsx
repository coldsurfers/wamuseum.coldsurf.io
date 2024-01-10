'use client'

import { signIn } from 'next-auth/react'
import { useCallback } from 'react'

export default function LoginPage() {
    const onClickGoogleLogin = useCallback(async () => {
        await signIn('google')
    }, [])

    return (
        <section>
            <h1>Google Login</h1>
            <button onClick={onClickGoogleLogin}>Login</button>
        </section>
    )
}