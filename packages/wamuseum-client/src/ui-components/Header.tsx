import Link from 'next/link'
import styles from './Header.module.css'

export default function Header() {
  return (
    <h2 className={styles.heading}>
      <Link href="/">WaMuseum</Link>
    </h2>
  )
}
