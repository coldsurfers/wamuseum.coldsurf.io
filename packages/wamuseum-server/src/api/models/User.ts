/* eslint-disable class-methods-use-this */
import { prisma } from '../database/prisma'

export type UserSerialized = {
  id: string
  email: string
  username: string
  created_at: string
  is_staff: boolean
}

export default class User {
  public id?: string

  public username!: string

  public email!: string

  public password?: string

  public passwordSalt?: string

  public created_at?: Date

  public is_staff?: boolean

  constructor(params: {
    id?: string
    email: string
    username: string
    password?: string
    passwordSalt?: string
    created_at?: Date
    is_staff?: boolean
  }) {
    this.id = params.id
    this.email = params.email
    this.username = params.username
    this.password = params.password
    this.passwordSalt = params.passwordSalt
    this.created_at = params.created_at
    this.is_staff = params.is_staff
  }

  public static async find({
    email,
    username,
  }: {
    email?: string
    username: string
  }) {
    // eslint-disable-next-line no-underscore-dangle
    const _user = await prisma.user.findUnique({
      where: {
        email,
        username,
      },
    })

    if (!_user) return null

    const user = new User({
      email: _user.email,
      id: _user.id,
      created_at: _user.created_at,
      username: _user.username,
      password: _user.password,
      passwordSalt: _user.passwordSalt,
      is_staff: _user.is_staff,
    })

    return user
  }

  public async create() {
    if (!this.password || !this.passwordSalt) {
      throw Error('password, password salt')
    }
    // eslint-disable-next-line no-underscore-dangle
    const _user = await prisma.user.create({
      data: {
        email: this.email,
        username: this.username,
        password: this.password,
        passwordSalt: this.passwordSalt,
      },
    })

    if (!_user) return null

    const user = new User({
      created_at: _user.created_at,
      email: _user.email,
      id: _user.id,
      username: _user.username,
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
    const updated = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        email,
      },
    })

    const user = new User({
      id: updated.id,
      email: updated.email,
      username: updated.username,
      created_at: updated.created_at,
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
    const updated = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password,
        passwordSalt,
      },
    })

    const user = new User({
      ...updated,
    })

    return user
  }

  public serialize(): UserSerialized {
    return {
      id: this.id ?? '',
      email: this.email,
      username: this.username,
      created_at: this.created_at?.toISOString() ?? '',
      is_staff: !!this.is_staff,
    }
  }
}
