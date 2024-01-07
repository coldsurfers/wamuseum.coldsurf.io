import { FastifyError, RouteHandler } from 'fastify'
import Post from '../models/Post'

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
