// 'use client'

import { cache } from 'react'
import { z } from 'zod'
import { QueryKey, UseQueryOptions, useQuery } from '@tanstack/react-query'
import request from '@/libs/request'

const GetAcountListResponseSchema = z.array(
  z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string(),
    created_at: z.string().datetime(),
    staff: z.object({
      id: z.string().uuid(),
      is_authorized: z.boolean(),
      is_staff: z.boolean(),
      created_at: z.string().datetime(),
    }),
  })
)
type GetAccountListResponseSchemaType = z.infer<
  typeof GetAcountListResponseSchema
>

const cachedGetAccountList = cache(
  async (): Promise<GetAccountListResponseSchemaType> => {
    const result = await request('/v1/accounts', {
      method: 'GET',
    })

    const list = await result.json()
    const validated = GetAcountListResponseSchema.parse(list)
    return validated
  }
)

const useGetAccountListQuery = (
  options?: Omit<
    UseQueryOptions<
      GetAccountListResponseSchemaType,
      Error,
      GetAccountListResponseSchemaType,
      QueryKey
    >,
    'queryKey' | 'queryFn'
  >
) =>
  useQuery<
    GetAccountListResponseSchemaType,
    Error,
    GetAccountListResponseSchemaType,
    QueryKey
  >({
    ...options,
    queryKey: ['wamuseum/get-account-list'],
    queryFn: cachedGetAccountList,
  })

export default async function AccountsPage() {
  const result = await cachedGetAccountList()
  console.log(result)
  return (
    <div>
      <h1>Total Accounts Count</h1>
      <h1>Account List</h1>
    </div>
  )
}
