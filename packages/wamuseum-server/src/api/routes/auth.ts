import { FastifyPluginCallback } from 'fastify'
import {
  getUserCtrl,
  patchUserProfileCtrl,
  postLoginCtrl,
  postLogoutCtrl,
  postRegisterCtrl,
} from '../controllers/auth.ctrl'

const meRoute: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.post('/auth/register', postRegisterCtrl)
  fastify.post('/auth/login', postLoginCtrl)
  fastify.get('/auth/user', getUserCtrl)
  fastify.post('/auth/logout', postLogoutCtrl)
  fastify.patch('/auth/user/profile', patchUserProfileCtrl)
  done()
}

export default meRoute
