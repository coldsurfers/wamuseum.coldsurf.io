import Link from 'next/link'
import styles from './SideBar.module.css'

export default function SideBar() {
  return (
    <div className={styles.root}>
      <ul>
        <Link href="/louder">
          <li>Louder</li>
        </Link>
      </ul>
    </div>
  )
}
