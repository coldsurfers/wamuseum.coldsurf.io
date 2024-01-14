/* eslint-disable class-methods-use-this */
import { z } from 'zod'
import { prisma } from '../database/prisma'
import Staff, { StaffModelSchema, StaffSerializedSchema } from './Staff'

export const AccountModelSchema = z.object({
  id: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email(),
  password: z.string().optional(),
  passwordSalt: z.string().optional(),
  created_at: z.date().optional(),
  provider: z.string().optional(),
  staff: StaffModelSchema.optional(),
})

export type AccountModelSchemaType = z.infer<typeof AccountModelSchema>

export const AccountSerializedSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  created_at: z.string(),
  staff: StaffSerializedSchema.optional(),
})

export type AccountSerializedSchemaType = z.infer<
  typeof AccountSerializedSchema
>

export default class Account {
  private props: AccountModelSchemaType

  constructor(props: AccountModelSchemaType) {
    this.props = props
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

  public static async list({
    skip,
    take,
    includeStaff,
  }: {
    skip: number
    take: number
    includeStaff?: boolean
  }) {
    const list = await prisma.account.findMany({
      include: {
        staff: includeStaff,
      },
      skip,
      take,
    })

    return list.map(
      (_user) =>
        new Account({
          ..._user,
          username: _user.username ?? undefined,
          password: _user.password ?? undefined,
          passwordSalt: _user.passwordSalt ?? undefined,
          provider: _user.provider ?? undefined,
          staff: _user.staff ? _user.staff : undefined,
        })
    )
  }

  public get id() {
    return this.props.id
  }

  public get email() {
    return this.props.email
  }

  public async create(): Promise<Account> {
    const created = await prisma.account.create({
      data: {
        ...this.props,
        staff: {
          create: {
            is_authorized: false,
            is_staff: false,
          },
        },
      },
    })

    return new Account({
      ...created,
      email: created.email,
      password: created.password ?? undefined,
      passwordSalt: created.passwordSalt ?? undefined,
      provider: created.provider ?? undefined,
      username: created.username ?? undefined,
    })
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

  public serialize(): AccountSerializedSchemaType {
    const staff = this.props.staff
      ? new Staff({
          ...this.props.staff,
        })
      : undefined
    return {
      id: this.props.id ?? '',
      email: this.props.email,
      username: this.props.username ?? '',
      created_at: this.props.created_at?.toISOString() ?? '',
      staff: staff?.serialize() ?? undefined,
    }
  }
}
