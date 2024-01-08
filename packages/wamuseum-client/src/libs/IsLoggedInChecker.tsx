'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function IsLoggedInChecker() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!session && pathname !== '/login') {
      router.push('/login')
    }
  }, [pathname, router, session])

  return null
}
