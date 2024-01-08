'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import styles from './Header.module.css'

export default function Header() {
  const { data: session } = useSession()
  return (
    <h2 className={styles.heading}>
      <Link href="/">WaMuseum</Link>
      {session && <p>Logout</p>}
    </h2>
  )
}
