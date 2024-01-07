import { prisma } from '../database/prisma'

export type TrackSerialized = {
  id: string
  filename: string
  url: string
  created_at: string
  post_id?: string
}

export default class Track {
  public id?: string

  public filename!: string

  public url!: string

  public created_at?: Date

  public post_id?: string | null

  public song_id?: string | null

  constructor(params: {
    id?: string
    filename: string
    url: string
    created_at?: Date
    post_id?: string | null
    song_id?: string | null
  }) {
    this.id = params.id
    this.filename = params.filename
    this.url = params.url
    this.created_at = params.created_at
    this.post_id = params.post_id
    this.song_id = params.song_id
  }

  public async create() {
    const created = await prisma.track.create({
      data: {
        filename: this.filename,
        url: this.url,
        post_id: this.post_id,
        song_id: this.song_id,
      },
    })

    return new Track({
      ...created,
      post_id: this.post_id,
    })
  }

  public async updatePostId({ postId }: { postId: string }) {
    const updated = await prisma.track.update({
      where: {
        id: this.id,
      },
      data: {
        post_id: postId,
      },
    })

    return new Track({
      ...updated,
    })
  }

  public async updateSongId({ songId }: { songId: string }) {
    await prisma.track.delete({
      where: {
        song_id: songId,
      },
    })
    const updated = await prisma.track.update({
      where: {
        id: this.id,
      },
      data: {
        song_id: songId,
      },
    })

    return new Track({
      ...updated,
    })
  }

  public static async findByFilename(filename: string) {
    const found = await prisma.track.findFirst({
      where: {
        filename,
      },
    })

    if (!found) return null

    return new Track({
      ...found,
    })
  }

  public serialize(): TrackSerialized {
    return {
      id: this.id ?? '',
      filename: this.filename,
      url: this.url,
      created_at: this.created_at ? this.created_at.toISOString() : '',
      post_id: this.post_id ?? undefined,
    }
  }
}
