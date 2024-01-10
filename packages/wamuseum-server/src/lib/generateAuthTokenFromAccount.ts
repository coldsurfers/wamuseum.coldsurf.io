import Account from '../api/models/Account'
import AuthToken from '../api/models/AuthToken'
import { fastify } from '../server'

export default async function generateAuthTokenFromAccount(account: Account) {
  const { id: accountId } = account
  if (!accountId) {
    throw Error('accountId should not be undefined')
  }

  const authToken = new AuthToken({
    access_token: await fastify.jwt.sign(
      {
        email: account.email,
        id: accountId,
      },
      {
        expiresIn: '7d',
      }
    ),
    refresh_token: await fastify.jwt.sign(
      {
        email: account.email,
        id: accountId,
      },
      {
        expiresIn: '30d',
      }
    ),
    account_id: accountId,
  })
  return authToken
}
