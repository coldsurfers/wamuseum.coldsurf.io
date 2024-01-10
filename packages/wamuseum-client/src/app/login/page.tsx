'use client'

import { signIn } from 'next-auth/react'
import { useCallback } from 'react'

export default function LoginPage() {
  const onClickGoogleLogin = useCallback(async () => {
    await signIn('google')
  }, [])

  return (
    <div>
      <section>
        <h2>Google Login</h2>
        <button onClick={onClickGoogleLogin}>Login</button>
      </section>
    </div>
  )
}
