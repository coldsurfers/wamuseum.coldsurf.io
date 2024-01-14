import { FastifyPluginCallback } from 'fastify'
import {
  getStaffDetailCtrl,
  getStaffListCtrl,
  postStaffAuthorizeCtrl,
} from '../controllers/staff.ctrl'
import { JWTDecoded } from '../../types/jwt'
import Staff from '../models/Staff'

const staffRoute: FastifyPluginCallback = (fastify, opts, done) => {
  // eslint-disable-next-line consistent-return
  fastify.addHook('onRequest', async (req, rep) => {
    const result = (await req.jwtDecode()) as JWTDecoded
    const { id: accountId } = result
    const staff = await Staff.findByAccountId(accountId)

    if (!staff?.is_staff) {
      return rep.status(403).send()
    }
  })
  fastify.get('/staff', getStaffListCtrl)
  fastify.get('/staff/:staffId', getStaffDetailCtrl)
  fastify.post('/staff/:staffId/authorize', postStaffAuthorizeCtrl)
  done()
}

export default staffRoute
