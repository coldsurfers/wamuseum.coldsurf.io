/* eslint-disable class-methods-use-this */
import { prisma } from '../database/prisma'

export type AccountSerialized = {
  id: string
  email: string
  username: string
  created_at: string
}

export default class Account {
  public id?: string

  public username?: string

  public email!: string

  public password?: string

  public passwordSalt?: string

  public created_at?: Date

  public is_staff?: boolean

  public provider?: string

  constructor(params: {
    id?: string
    email: string
    username?: string
    password?: string
    passwordSalt?: string
    created_at?: Date
    is_staff?: boolean
    provider?: string
  }) {
    this.id = params.id
    this.email = params.email
    this.username = params.username
    this.password = params.password
    this.passwordSalt = params.passwordSalt
    this.created_at = params.created_at
    this.is_staff = params.is_staff
    this.provider = params.provider
  }

  public static async findByEmail(email: string) {
    // eslint-disable-next-line no-underscore-dangle
    const _user = await prisma.account.findUnique({
      where: {
        email,
      },
    })

    if (!_user) return null

    const user = new Account({
      ..._user,
      username: _user.username ?? undefined,
      password: _user.password ?? undefined,
      passwordSalt: _user.passwordSalt ?? undefined,
      provider: _user.provider ?? undefined,
    })

    return user
  }

  public async create() {
    // eslint-disable-next-line no-underscore-dangle
    const _user = await prisma.account.create({
      data: {
        email: this.email,
        username: this.username,
        password: this.password,
        passwordSalt: this.passwordSalt,
        provider: this.provider,
      },
    })

    if (!_user) return null

    const user = new Account({
      created_at: _user.created_at,
      email: _user.email,
      id: _user.id,
      username: _user.username ?? undefined,
      provider: _user.provider ?? undefined,
    })

    return user
  }

  public static async changeEmail({
    userId,
    email,
  }: {
    userId: string
    email: string
  }) {
    const updated = await prisma.account.update({
      where: {
        id: userId,
      },
      data: {
        email,
      },
    })

    const user = new Account({
      ...updated,
      username: updated.username ?? undefined,
      password: updated.password ?? undefined,
      passwordSalt: updated.passwordSalt ?? undefined,
      provider: updated.provider ?? undefined,
    })

    return user
  }

  public static async changePassword({
    userId,
    password,
    passwordSalt,
  }: {
    userId: string
    password: string
    passwordSalt: string
  }) {
    const updated = await prisma.account.update({
      where: {
        id: userId,
      },
      data: {
        password,
        passwordSalt,
      },
    })

    const user = new Account({
      ...updated,
      username: updated.username ?? undefined,
      password: updated.password ?? undefined,
      passwordSalt: updated.passwordSalt ?? undefined,
      provider: updated.provider ?? undefined,
    })

    return user
  }

  public serialize(): AccountSerialized {
    return {
      id: this.id ?? '',
      email: this.email,
      username: this.username ?? '',
      created_at: this.created_at?.toISOString() ?? '',
    }
  }
}
