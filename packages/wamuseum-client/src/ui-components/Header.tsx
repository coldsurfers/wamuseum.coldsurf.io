'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useCallback } from 'react'
import styles from './Header.module.css'

export default function Header() {
  const { data: session } = useSession()
  const onClickLogout = useCallback(async () => {
    await signOut()
  }, [])
  return (
    <h2 className={styles.heading}>
      <Link href="/">WaMuseum</Link>
      {session && <p onClick={onClickLogout}>Logout</p>}
    </h2>
  )
}
