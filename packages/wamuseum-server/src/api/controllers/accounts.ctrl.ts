import { FastifyError, RouteHandler } from 'fastify'
import { z } from 'zod'
import OAuth2Client from '../../lib/OAuth2Client'
import Account from '../models/Account'
import generateAuthTokenFromAccount from '../../lib/generateAuthTokenFromAccount'
import { JWTDecoded } from '../../types/jwt'
import AuthToken from '../models/AuthToken'

const PostAccountsSignupCtrlBodySchema = z.object({
  provider: z.string(),
  access_token: z.string(),
})

type PostAccountsSignupCtrlBodySchemaType = z.infer<
  typeof PostAccountsSignupCtrlBodySchema
>

const PostAccountsSignInCtrlBodySchema = z.object({
  provider: z.string(),
  access_token: z.string(),
})

type PostAccountsSignInCtrlBodySchemaType = z.infer<
  typeof PostAccountsSignInCtrlBodySchema
>

export const postAccountsSignupCtrl: RouteHandler<{
  Body: PostAccountsSignupCtrlBodySchemaType
}> = async (req, rep) => {
  try {
    const validation = PostAccountsSignupCtrlBodySchema.safeParse(req.body)
    if (!validation.success) {
      return rep.status(400).send()
    }
    const { data: postBody } = validation
    const { provider, access_token } = postBody
    if (provider !== 'google') return rep.status(501).send()
    const tokenInfo = await OAuth2Client.getTokenInfo(access_token)
    const { email: gmail } = tokenInfo
    if (!gmail) return rep.status(400).send()

    const existingAccount = await Account.findByEmail(gmail)
    if (existingAccount) return rep.status(409).send()

    const account = await new Account({
      email: gmail,
      provider: 'google',
    }).create()

    if (!account) return rep.status(500).send()
    const { id: accountId } = account

    if (!accountId) {
      return rep.status(500).send()
    }

    const accountAuthToken = await (
      await generateAuthTokenFromAccount(account)
    ).create()

    return rep.status(200).send({
      auth_token: accountAuthToken.serialize(),
      account: account.serialize(),
    })
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}

export const postAccountsSignInCtrl: RouteHandler<{
  Body: PostAccountsSignInCtrlBodySchemaType
}> = async (req, rep) => {
  try {
    const validation = PostAccountsSignInCtrlBodySchema.safeParse(req.body)
    if (!validation.success) {
      return rep.status(400).send()
    }
    const { data: postBody } = validation
    const { provider, access_token } = postBody
    if (provider !== 'google') return rep.status(501).send()
    const tokenInfo = await OAuth2Client.getTokenInfo(access_token)
    const { email: gmail } = tokenInfo
    if (!gmail) return rep.status(400).send()

    const account = await Account.findByEmail(gmail)
    if (!account) return rep.status(404).send()

    const accountAuthToken = await (
      await generateAuthTokenFromAccount(account)
    ).create()

    return rep.status(200).send({
      auth_token: accountAuthToken.serialize(),
      account: account.serialize(),
    })
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}

export const getAccountsProfileCtrl: RouteHandler<{}> = async (req, rep) => {
  try {
    const decoded = (await req.jwtDecode()) as JWTDecoded
    const user = await Account.findByEmail(decoded.email)

    if (!user) {
      return rep.status(403).send({})
    }

    return rep.status(200).send({
      ...user.serialize(),
    })
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}

export const postAccountsLogoutCtrl: RouteHandler<{}> = async (req, rep) => {
  try {
    // await req.jwtVerify();
    const decoded = (await req.jwtDecode()) as JWTDecoded
    const account = await Account.findByEmail(decoded.email)
    if (!account || !account.id) return rep.status(403).send()
    await AuthToken.deleteByAccountId(account.id)
    return rep.status(204).send()
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}

// export const patchAccountsProfileCtrl: RouteHandler<{
//   Body:
//     | {
//         category: 'password'
//         password: string
//         passwordCheck: string
//       }
//     | {
//         category: 'email'
//         email: string
//       }
// }> = async (req, rep) => {
//   const { category } = req.body
//   try {
//     const decoded = (await req.jwtDecode()) as JWTDecoded

//     switch (category) {
//       case 'email':
//         // eslint-disable-next-line no-case-declarations
//         const updated = await User.changeEmail({
//           userId: decoded.id,
//           email: req.body.email,
//         })
//         if (!updated.id) return rep.status(403).send()
//         // eslint-disable-next-line no-case-declarations
//         const authToken = new AuthToken({
//           auth_token: await rep.jwtSign(
//             {
//               email: updated.email,
//               username: updated.username,
//               id: updated.id,
//             },
//             {
//               expiresIn: '7d',
//             }
//           ),
//           refresh_token: await rep.jwtSign(
//             {
//               email: updated.email,
//               username: updated.username,
//               id: updated.id,
//             },
//             {
//               expiresIn: '30d',
//             }
//           ),
//           user_id: updated.id,
//         })
//         return rep.status(200).send({
//           user: updated.serialize(),
//           token: authToken.auth_token,
//           refresh_token: authToken.refresh_token,
//         })
//       case 'password':
//         if (req.body.password !== req.body.passwordCheck) {
//           return rep.status(400).send()
//         }
//         // eslint-disable-next-line no-case-declarations
//         const user = await User.find({
//           username: decoded.username,
//         })
//         if (!user || !user.id) return rep.status(404).send()
//         // eslint-disable-next-line no-case-declarations
//         const { encrypted, salt } = encryptPassword({
//           plain: req.body.password,
//           originalSalt: user.passwordSalt,
//         })
//         // eslint-disable-next-line no-case-declarations
//         const passwordChangedUser = await User.changePassword({
//           userId: user.id,
//           password: encrypted,
//           passwordSalt: salt,
//         })
//         return rep.status(200).send({
//           user: passwordChangedUser.serialize(),
//         })
//       default:
//         break
//     }

//     return rep.status(501).send()
//   } catch (e) {
//     const error = e as FastifyError
//     return rep.status(error.statusCode ?? 500).send(error)
//   }
// }
