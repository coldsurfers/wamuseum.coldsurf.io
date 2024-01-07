import { FastifyPluginCallback } from 'fastify'
import { getMeCtrl } from '../controllers/me.ctrl'

const meRoute: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.get('/me', getMeCtrl)
  done()
}

export default meRoute
