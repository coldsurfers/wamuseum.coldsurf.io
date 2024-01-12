'use client'

import { useSession } from 'next-auth/react'
import { redirect, usePathname } from 'next/navigation'
import { useLayoutEffect } from 'react'

export default function ProtectedRouter() {
  const { data: session } = useSession()
  const pathname = usePathname()
  useLayoutEffect(() => {
    if (!session && !pathname.includes('/login')) {
      redirect('/login')
    }
  }, [pathname, session])

  return null
}
