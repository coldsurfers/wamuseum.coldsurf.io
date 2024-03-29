// 'use client'

import { cache } from 'react'
import { z } from 'zod'
import { QueryKey, UseQueryOptions, useQuery } from '@tanstack/react-query'
import request from '@/libs/request'

const GetAcountListResponseSchema = z.object({
  data: z.array(
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
  ),
  totalCount: z.number(),
})
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
  return (
    <div>
      <h1>Total Accounts Count</h1>
      <h3>{result.totalCount}</h3>
      <h1>Account List</h1>
      {result.data.slice(0, 10).map((each) => (
        <div key={each.id}>
          <h3>
            {each.email} (
            {each.staff.is_authorized ? 'authorized' : 'not authorized'})
          </h3>
        </div>
      ))}
    </div>
  )
}
