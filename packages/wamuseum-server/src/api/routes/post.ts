import { FastifyPluginCallback } from 'fastify'
import { getPostListCtrl } from '../controllers/post.ctrl'

const postRoute: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.get('/post', getPostListCtrl)
  done()
}

export default postRoute
