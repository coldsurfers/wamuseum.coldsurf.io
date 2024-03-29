import { z } from 'zod'
import { prisma } from '../database/prisma'

export const StaffModelSchema = z.object({
  id: z.string().optional(),
  created_at: z.date().optional(),
  is_staff: z.boolean().optional(),
  is_authorized: z.boolean().optional(),
  account_id: z.string(),
})

export type StaffModelSchemaType = z.infer<typeof StaffModelSchema>

export const StaffSerializedSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  is_staff: z.boolean(),
  is_authorized: z.boolean(),
})

export type StaffSerializedSchemaType = z.infer<typeof StaffSerializedSchema>

export default class Staff {
  private props: StaffModelSchemaType

  public constructor(props: StaffModelSchemaType) {
    this.props = props
  }

  public async create(): Promise<Staff> {
    const created = await prisma.staff.create({
      data: {
        ...this.props,
      },
    })

    return new Staff({
      ...created,
    })
  }

  public static async findByStaffId(staffId: string): Promise<Staff | null> {
    const found = await prisma.staff.findUnique({
      where: {
        id: staffId,
      },
    })
    if (!found) return null
    return new Staff({
      ...found,
    })
  }

  public static async findByAccountId(
    accountId: string
  ): Promise<Staff | null> {
    const staff = await prisma.staff.findUnique({
      where: {
        account_id: accountId,
      },
    })

    if (!staff) return null

    return new Staff({
      ...staff,
    })
  }

  public static async list({
    skip,
    take,
  }: {
    skip: number
    take: number
  }): Promise<Staff[]> {
    const list = await prisma.staff.findMany({
      skip,
      take,
    })

    return list.map(
      (staffEach) =>
        new Staff({
          ...staffEach,
        })
    )
  }

  public static async authorizeByStaffId(staffId: string): Promise<Staff> {
    const staff = await prisma.staff.update({
      where: {
        id: staffId,
      },
      data: {
        is_authorized: true,
      },
    })
    return new Staff({
      ...staff,
    })
  }

  public get is_staff() {
    return this.props.is_staff ?? false
  }

  public serialize(): StaffSerializedSchemaType {
    return {
      id: this.props.id ?? '',
      is_authorized: this.props.is_authorized ?? false,
      is_staff: this.props.is_staff ?? false,
      created_at: this.props.created_at?.toISOString() ?? '',
    }
  }
}
