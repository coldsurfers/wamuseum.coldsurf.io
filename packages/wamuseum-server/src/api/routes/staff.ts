import { FastifyPluginCallback } from 'fastify'
import {
  getStaffDetailCtrl,
  getStaffListCtrl,
  postStaffAuthorizeCtrl,
} from '../controllers/staff.ctrl'

const staffRoute: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.get('/staff', getStaffListCtrl)
  fastify.get('/staff/:staffId', getStaffDetailCtrl)
  fastify.post('/staff/authorize', postStaffAuthorizeCtrl)
  done()
}

export default staffRoute
