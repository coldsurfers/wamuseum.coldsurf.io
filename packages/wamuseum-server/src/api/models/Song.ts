import { prisma } from '../database/prisma'

export default class Song {
  public id?: string

  public created_at?: Date

  public title!: string

  public post_id?: string | null

  constructor(params: {
    id?: string
    created_at?: Date
    title: string
    post_id?: string | null
  }) {
    this.id = params.id
    this.created_at = params.created_at
    this.title = params.title
    this.post_id = params.post_id
  }

  public async create() {
    const created = await prisma.song.create({
      data: {
        title: this.title,
        post_id: this.post_id,
      },
    })

    return new Song({
      ...created,
    })
  }

  public async update({ title }: { title: string }) {
    const updated = await prisma.song.update({
      where: {
        id: this.id,
      },
      data: {
        title,
      },
    })

    return new Song({
      ...updated,
    })
  }
}
