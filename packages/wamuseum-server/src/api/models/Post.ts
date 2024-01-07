import { prisma } from '../database/prisma'
import AlbumCover from './AlbumCover'
import Song from './Song'
import Track from './Track'

type PostSerialized = {
  id: string
  title: string
  artist_name: string
  created_at: string
  song_names: string[]
  album_cover: string | null // url
  album_track_file_names: string[]
}

export default class Post {
  public id?: string

  public title!: string

  public artist_name!: string

  public created_at?: Date

  public album_cover?: AlbumCover

  public song?: Song[]

  public track?: Track[]

  constructor(params: {
    id?: string
    title: string
    artist_name: string
    created_at?: Date
    album_cover?: AlbumCover
    song?: Song[]
    track?: Track[]
  }) {
    this.id = params.id
    this.title = params.title
    this.artist_name = params.artist_name
    this.created_at = params.created_at
    this.album_cover = params.album_cover
    this.song = params.song
    this.track = params.track
  }

  public async create() {
    const created = await prisma.post.create({
      data: {
        title: this.title,
        artist_name: this.artist_name,
      },
    })

    return new Post({
      ...created,
    })
  }

  public async update({
    title,
    artist_name,
  }: {
    title: string
    artist_name: string
  }) {
    const updated = await prisma.post.update({
      where: {
        id: this.id,
      },
      data: {
        title,
        artist_name,
      },
    })

    return new Post({
      ...updated,
    })
  }

  public static async list({
    page,
    perPage = 20,
  }: {
    page: number
    perPage?: number
  }) {
    const result = await prisma.post.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        album_cover: true,
        song: true,
        track: true,
      },
    })

    const list = result.map(
      (value) =>
        new Post({
          ...value,
          album_cover: value.album_cover
            ? new AlbumCover({
                ...value.album_cover,
              })
            : undefined,
          song: value.song.map(
            (song) =>
              new Song({
                ...song,
              })
          ),
          track: value.track.map(
            // eslint-disable-next-line no-shadow
            (value) =>
              new Track({
                ...value,
              })
          ),
        })
    )

    return list
  }

  public static async findById(postId: string) {
    const result = await prisma.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        song: true,
        track: true,
        album_cover: true,
      },
    })

    if (!result) return null
    const post = new Post({
      ...result,
      song: result.song.map(
        (song) =>
          new Song({
            ...song,
          })
      ),
      track: result.track.map((track) => new Track({ ...track })),
      album_cover: result.album_cover
        ? new AlbumCover({ ...result.album_cover })
        : undefined,
    })

    return post
  }

  public static async totalCount() {
    const totalCount = await prisma.post.count({})
    return totalCount
  }

  public static async delete(postId: string) {
    await prisma.post.delete({
      where: {
        id: postId,
      },
    })
  }

  public serialize(): PostSerialized {
    return {
      id: this.id ?? '',
      album_cover: this.album_cover?.url ?? null,
      artist_name: this.artist_name,
      created_at: this.created_at?.toISOString() ?? '',
      song_names: this.song?.map((song) => song.title) ?? [],
      title: this.title,
      album_track_file_names: this.track?.map((value) => value.url) ?? [],
    }
  }
}
