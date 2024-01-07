import { prisma } from '../database/prisma'

export type AlbumCoverSerialized = {
  id: string
  filename: string
  url: string
  created_at: string
  post_id: string
}

export default class AlbumCover {
  public id?: string

  public filename!: string

  public url!: string

  public created_at?: Date

  public post_id!: string

  constructor(params: {
    id?: string
    filename: string
    url: string
    created_at?: Date
    post_id: string
  }) {
    this.id = params.id
    this.filename = params.filename
    this.url = params.url
    this.created_at = params.created_at
    this.post_id = params.post_id
  }

  public async create() {
    const created = await prisma.albumCover.create({
      data: {
        filename: this.filename,
        url: this.url,
        post_id: this.post_id,
      },
    })

    return new AlbumCover({
      ...created,
    })
  }

  public async update({ url, filename }: { url: string; filename: string }) {
    const updated = await prisma.albumCover.update({
      data: {
        url,
        filename,
      },
      where: {
        id: this.id,
      },
    })

    return new AlbumCover({
      ...updated,
    })
  }

  public serialize(): AlbumCoverSerialized {
    return {
      id: this.id ?? '',
      filename: this.filename,
      url: this.url,
      created_at: this.created_at ? this.created_at.toISOString() : '',
      post_id: this.post_id,
    }
  }
}
