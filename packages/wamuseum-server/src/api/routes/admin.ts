import { FastifyPluginCallback } from 'fastify'
import {
  postAdminPostCtrl,
  postAdminUploadTrack,
  getPostListCtrl,
  getPostDetailCtrl,
  patchPostDetailCtrl,
  deletePostDetailCtrl,
  postAdminPresigned,
} from '../controllers/admin.ctrl'
import { JWTDecoded } from '../../types/jwt'
import User from '../models/User'

const adminRoute: FastifyPluginCallback = (fastify, opts, done) => {
  // eslint-disable-next-line consistent-return
  fastify.addHook('onRequest', async (req, rep) => {
    const result = (await req.jwtDecode()) as JWTDecoded
    const { email, username } = result
    const user = await User.find({
      email,
      username,
    })

    if (!user?.is_staff) {
      return rep.status(403).send()
    }
  })

  fastify.get('/admin/posts', getPostListCtrl)
  fastify.post('/admin/posts', postAdminPostCtrl)
  fastify.get('/admin/posts/:postId', getPostDetailCtrl)
  fastify.patch('/admin/posts/:postId', patchPostDetailCtrl)
  fastify.delete('/admin/posts/:postId', deletePostDetailCtrl)
  fastify.post('/admin/uploads', postAdminUploadTrack)
  fastify.post('/admin/pre-signed', postAdminPresigned)
  done()
}

export default adminRoute
