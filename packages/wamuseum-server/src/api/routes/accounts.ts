import { FastifyPluginCallback } from 'fastify'
import {
  getAccountsProfileCtrl,
  // patchAccountsProfileCtrl,
  postAccountsLogoutCtrl,
  postAccountsSignInCtrl,
} from '../controllers/accounts.ctrl'

const accountsRoute: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.post('/accounts/signin', postAccountsSignInCtrl)
  fastify.post('/accounts/logout', postAccountsLogoutCtrl)
  fastify.get('/accounts/profile', getAccountsProfileCtrl)
  // fastify.patch('/accounts/profile', patchAccountsProfileCtrl)
  done()
}

export default accountsRoute
