/* eslint-disable no-underscore-dangle */
import { prisma } from '../database/prisma'

export type AuthTokenSerialized = {
  id: string
  auth_token: string
  refresh_token: string
  user_id: string
  created_at: string
}

export default class AuthToken {
  public id?: string

  public auth_token!: string

  public refresh_token!: string

  public user_id!: string

  public created_at?: Date

  constructor(params: {
    id?: string
    auth_token: string
    refresh_token: string
    user_id: string
    created_at?: Date
  }) {
    this.id = params.id
    this.auth_token = params.auth_token
    this.refresh_token = params.refresh_token
    this.user_id = params.user_id
    this.created_at = params.created_at
  }

  public static async getByUserId(userId: string) {
    // eslint-disable-next-line no-return-await
    const _authToken = await prisma.authToken.findUnique({
      where: {
        user_id: userId,
      },
    })

    if (!_authToken) return null

    const authToken = new AuthToken({
      auth_token: _authToken.auth_token,
      refresh_token: _authToken.refresh_token,
      user_id: _authToken.user_id,
      id: _authToken.id,
      created_at: _authToken.created_at,
    })

    return authToken
  }

  public static async deleteByUserId(userId: string) {
    await prisma.authToken.delete({
      where: {
        user_id: userId,
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
    const existing = await AuthToken.getByUserId(this.user_id)
    if (existing && existing.id) {
      await AuthToken.deleteById(existing.id)
    }
    // eslint-disable-next-line no-return-await
    const _authToken = await prisma.authToken.create({
      data: {
        auth_token: this.auth_token,
        refresh_token: this.refresh_token,
        user_id: this.user_id,
      },
    })

    const authToken = new AuthToken({
      ..._authToken,
    })

    return authToken
  }

  public serialize(): AuthTokenSerialized {
    return {
      id: this.id ?? '',
      auth_token: this.auth_token,
      refresh_token: this.refresh_token,
      user_id: this.user_id,
      created_at: this.created_at?.toISOString() ?? '',
    }
  }
}
