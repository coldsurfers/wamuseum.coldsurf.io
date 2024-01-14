import { FastifyPluginCallback } from 'fastify'
import {
  getAccountsProfileCtrl,
  // patchAccountsProfileCtrl,
  postAccountsLogoutCtrl,
  postAccountsSignInCtrl,
  getAccountsListCtrl,
} from '../controllers/accounts.ctrl'

const accountsRoute: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.get('/accounts', getAccountsListCtrl)
  fastify.get('/accounts/:accountId', getAccountsProfileCtrl)
  fastify.post('/accounts/signin', postAccountsSignInCtrl)
  fastify.post('/accounts/logout', postAccountsLogoutCtrl)
  // fastify.patch('/accounts/profile', patchAccountsProfileCtrl)
  done()
}

export default accountsRoute
