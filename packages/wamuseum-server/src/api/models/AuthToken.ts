/* eslint-disable no-underscore-dangle */
import { prisma } from '../database/prisma'

export type AuthTokenSerialized = {
  access_token: string
  refresh_token: string
}

export default class AuthToken {
  public id?: string

  public access_token!: string

  public refresh_token!: string

  public account_id!: string

  public created_at?: Date

  constructor(params: {
    id?: string
    access_token: string
    refresh_token: string
    account_id: string
    created_at?: Date
  }) {
    this.id = params.id
    this.access_token = params.access_token
    this.refresh_token = params.refresh_token
    this.account_id = params.account_id
    this.created_at = params.created_at
  }

  public static async findByAccountId(accountId: string) {
    // eslint-disable-next-line no-return-await
    const _authToken = await prisma.authToken.findUnique({
      where: {
        account_id: accountId,
      },
    })

    if (!_authToken) return null

    const authToken = new AuthToken({
      access_token: _authToken.access_token,
      refresh_token: _authToken.refresh_token,
      account_id: _authToken.account_id,
      id: _authToken.id,
      created_at: _authToken.created_at,
    })

    return authToken
  }

  public static async deleteByAccountId(accountId: string) {
    await prisma.authToken.delete({
      where: {
        account_id: accountId,
      },
    })
  }

  public static async deleteById(id: string) {
    await prisma.authToken.delete({
      where: {
        id,
      },
    })
  }

  public async create() {
    const existing = await AuthToken.findByAccountId(this.account_id)
    if (existing && existing.id) {
      await AuthToken.deleteById(existing.id)
    }
    // eslint-disable-next-line no-return-await
    const _authToken = await prisma.authToken.create({
      data: {
        access_token: this.access_token,
        refresh_token: this.refresh_token,
        account_id: this.account_id,
      },
    })

    const authToken = new AuthToken({
      ..._authToken,
    })

    return authToken
  }

  public serialize(): AuthTokenSerialized {
    return {
      access_token: this.access_token,
      refresh_token: this.refresh_token,
    }
  }
}
