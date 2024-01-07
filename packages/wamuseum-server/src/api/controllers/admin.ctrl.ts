import { FastifyError, RouteHandler } from 'fastify'

import fs from 'fs'
import util from 'util'
import { pipeline } from 'node:stream'
import path from 'path'
import { generateUUID } from '@coldsurfers/shared-utils'
import Track from '../models/Track'
import Post from '../models/Post'
import Song from '../models/Song'
import AlbumCover from '../models/AlbumCover'
import createPresignedPost from '../../lib/createPresignedPost'
import { AWS_S3_ADMIN_PRESIGNED_DIR, ONE_MB_TO_BYTE } from '../../lib/constants'

const pump = util.promisify(pipeline)

export const postAdminPresigned: RouteHandler<{
  Body: {
    filename: string
    contentType: string
  }
}> = async (req, rep) => {
  try {
    const { filename, contentType } = req.body
    const result = await createPresignedPost({
      Bucket: process.env.AWS_S3_BUCKET ?? '',
      Key: `${AWS_S3_ADMIN_PRESIGNED_DIR}/media/${filename}`,
      Fields: {
        acl: 'public-read',
        'Content-Type': contentType,
      },
      Expires: 600, // seconds
      Conditions: [
        ['content-length-range', 0, ONE_MB_TO_BYTE * 3], // up to 1 MB * 3 = 3 MB
      ],
    })
    return rep.status(201).send(result)
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}

export const getPostListCtrl: RouteHandler<{
  Querystring: {
    page: string
  }
}> = async (req, rep) => {
  try {
    const { page: pageQueryString } = req.query
    const page: number = +pageQueryString
    const perPage = 20
    const results = await Post.list({
      page,
      perPage,
    })
    const count = await Post.totalCount()
    return rep.status(200).send({
      results: results.map((result) => result.serialize()),
      next: results.length < perPage ? null : page + 1,
      previous: page === 1 ? null : page - 1,
      count,
    })
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}

export const getPostDetailCtrl: RouteHandler<{
  Params: {
    postId: string
  }
}> = async (req, rep) => {
  try {
    const post = await Post.findById(req.params.postId)
    return rep.status(200).send({
      ...post?.serialize(),
    })
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}

export const patchPostDetailCtrl: RouteHandler<{
  Params: {
    postId: string
  }
}> = async (req, rep) => {
  try {
    const parts = await req.parts()
    if (!parts) {
      return rep.status(400).send()
    }

    const post = await Post.findById(req.params.postId)

    if (!post || !post.id) return rep.status(404).send()

    const prePost = {
      artist_name: '',
      title: '',
    }

    let albumCoverFilename = ''
    let songIdsOnPost: string[] = []
    let songNames = ''
    let albumTrackFilenames = ''
    // eslint-disable-next-line no-restricted-syntax
    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname === 'album_cover') {
          albumCoverFilename = `${generateUUID()}-${part.filename ?? ''}`
          await pump(
            part.file,
            fs.createWriteStream(
              path.resolve(
                __dirname,
                `../../../public/media/${albumCoverFilename}`
              )
            )
          )
        }
      } else {
        if (part.fieldname === 'artist_name') {
          prePost.artist_name = part.value as string
        }
        if (part.fieldname === 'title') {
          prePost.title = part.value as string
        }
        if (part.fieldname === 'song_names') {
          songNames = part.value as string
        }
        if (part.fieldname === 'album_track_file_names') {
          albumTrackFilenames = part.value as string
        }
      }
    }

    await post.update(prePost)
    await post.album_cover?.update({
      url: `/media/${albumCoverFilename}`,
      filename: albumCoverFilename,
    })

    const songs = songNames.split(',')
    const songsOnPost = await Promise.all(
      post.song?.map(async (song, index) => {
        const updated = await song.update({ title: songs[index] })
        return updated
      }) ?? []
    )

    songIdsOnPost = songsOnPost.map((value) => value.id!)

    await Promise.all(
      albumTrackFilenames.split(',').map(async (filename, index) => {
        const track = await Track.findByFilename(filename)
        if (!track) return
        // eslint-disable-next-line no-underscore-dangle
        const _songId = songIdsOnPost.at(index)
        if (_songId) {
          await track.updateSongId({
            songId: _songId,
          })
        }
      })
    )

    return rep.status(200).send()
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}

export const postAdminPostCtrl: RouteHandler<{}> = async (req, rep) => {
  try {
    const parts = await req.parts()

    const prePost = {
      title: '',
      artist_name: '',
    }
    let albumCoverFilename = ''
    let songIdsOnPost: string[] = []
    let albumTrackFilenames = ''
    let songNames = ''

    // eslint-disable-next-line no-restricted-syntax
    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname === 'album_cover') {
          albumCoverFilename = `${generateUUID()}-${part.filename ?? ''}`
          await pump(
            part.file,
            fs.createWriteStream(
              path.resolve(
                __dirname,
                `../../../public/media/${albumCoverFilename}`
              )
            )
          )
        }
      } else {
        if (part.fieldname === 'artist_name') {
          prePost.artist_name = part.value as string
        }
        if (part.fieldname === 'title') {
          prePost.title = part.value as string
        }
        if (part.fieldname === 'song_names') {
          songNames = part.value as string
        }
        if (part.fieldname === 'album_track_file_names') {
          albumTrackFilenames = part.value as string
        }
      }
    }

    const post = await new Post(prePost).create()
    if (!post || !post.id) return rep.status(500).send()
    const { id: postId } = post

    await new AlbumCover({
      filename: albumCoverFilename,
      post_id: postId,
      url: `/media/${albumCoverFilename}`,
    }).create()

    const songs = songNames.split(',')
    const songsOnPost = await Promise.all(
      songs.map(async (song) => {
        const created = await new Song({
          title: song,
          post_id: postId,
        }).create()
        return created
      })
    )
    songIdsOnPost = songsOnPost.map((value) => value.id!)

    await Promise.all(
      albumTrackFilenames.split(',').map(async (filename, index) => {
        const track = await Track.findByFilename(filename)
        if (!track) return
        // eslint-disable-next-line no-underscore-dangle
        const _postId = post.id
        if (_postId) {
          await track.updatePostId({ postId: _postId })
        }
        // eslint-disable-next-line no-underscore-dangle
        const _songId = songIdsOnPost.at(index)
        if (_songId) {
          await track.updateSongId({
            songId: _songId,
          })
        }
      })
    )

    return rep.status(201).send()
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}

export const deletePostDetailCtrl: RouteHandler<{
  Params: {
    postId: string
  }
}> = async (req, rep) => {
  try {
    await Post.delete(req.params.postId)
    return rep.status(204).send()
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}

export const postAdminUploadTrack: RouteHandler<{}> = async (req, rep) => {
  try {
    const data = await req.file()
    if (data?.type !== 'file') {
      return rep.status(400).send()
    }
    const randomFilename = `${generateUUID()}-${
      data?.filename ? data.filename : ''
    }`
    if (data && data.file) {
      await pump(
        data.file,
        fs.createWriteStream(
          path.resolve(__dirname, `../../../public/media/${randomFilename}`)
        )
      )
    }

    const track = new Track({
      filename: randomFilename,
      url: `/media/${randomFilename}`,
    })

    const created = await track.create()

    return rep.status(201).send({
      id: created.id,
      track_file: created.url,
    })
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}
