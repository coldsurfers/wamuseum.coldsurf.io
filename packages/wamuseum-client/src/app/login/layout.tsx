import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { auth } from '@/libs/auth'

export default async function LoginLayout({ children }: PropsWithChildren<{}>) {
  const session = await auth()
  if (session) redirect('/')
  return <>{children}</>
}
