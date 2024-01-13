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
import Staff from '../models/Staff'

const louderRoute: FastifyPluginCallback = (fastify, opts, done) => {
  // eslint-disable-next-line consistent-return
  fastify.addHook('onRequest', async (req, rep) => {
    const result = (await req.jwtDecode()) as JWTDecoded
    const { id: accountId } = result
    const staff = await Staff.findByAccountId(accountId)

    if (!staff?.is_staff) {
      return rep.status(403).send()
    }
  })

  fastify.get('/louder/posts', getPostListCtrl)
  fastify.post('/louder/posts', postAdminPostCtrl)
  fastify.get('/louder/posts/:postId', getPostDetailCtrl)
  fastify.patch('/louder/posts/:postId', patchPostDetailCtrl)
  fastify.delete('/louder/posts/:postId', deletePostDetailCtrl)
  fastify.post('/louder/uploads', postAdminUploadTrack)
  fastify.post('/louder/pre-signed', postAdminPresigned)
  done()
}

export default louderRoute
