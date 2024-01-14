import Link from 'next/link'
import styles from './SideBar.module.css'

export default function SideBar() {
  return (
    <div className={styles.root}>
      <ul>
        <li>
          <Link href="/louder">Louder</Link>
        </li>
        <li>
          <Link href="/accounts">Accounts</Link>
        </li>
      </ul>
    </div>
  )
}
