import { FastifyError, RouteHandler } from 'fastify'
import { z } from 'zod'
import nconf from 'nconf'
import OAuth2Client from '../../lib/OAuth2Client'
import Account from '../models/Account'
import generateAuthTokenFromAccount from '../../lib/generateAuthTokenFromAccount'
import { JWTDecoded } from '../../types/jwt'
import AuthToken from '../models/AuthToken'
import Staff from '../models/Staff'
import { sendEmail } from '../../lib/mailer'
import { parseQuerystringPage } from '../../lib/parseQuerystringPage'

const mailerSubject = '[Admin Request] Admin request has been submitted'
const mailerText = (gmail: string) =>
  `Hello, coldsurf administrator. You've got request email.\nNew comer email: ${gmail}`

const PostAccountsSignInCtrlBodySchema = z.object({
  provider: z.string(),
  access_token: z.string(),
})

type PostAccountsSignInCtrlBodySchemaType = z.infer<
  typeof PostAccountsSignInCtrlBodySchema
>

export const getAccountsListCtrl: RouteHandler<{
  Querystring: {
    page?: string
  }
}> = async (req, rep) => {
  try {
    const page = parseQuerystringPage(req.query.page)
    const perPage = 10
    const list = await Account.list({
      skip: (page - 1) * perPage,
      take: perPage,
      includeStaff: true,
    })
    console.log(list)
    return rep.status(200).send(list.map((each) => each.serialize()))
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

    const existingAccount = await Account.findByEmail(gmail)
    // sign "up" flow
    if (!existingAccount) {
      const newAccount = await new Account({
        email: gmail,
        provider: 'google',
      }).create()
      if (!newAccount) return rep.status(500).send()
      sendEmail({
        to: nconf.get('MAILER_EMAIL_ADDRESS'),
        subject: mailerSubject,
        text: mailerText(gmail),
      })
      return rep.status(201).send({
        account: newAccount.serialize(),
        auth_token: null,
      })
    }

    // sign "in" flow
    const { id: existingAccountId } = existingAccount

    if (!existingAccountId) return rep.status(404).send()

    const staff = await Staff.findByAccountId(existingAccountId)

    if (!staff?.is_staff) return rep.status(404).send()

    const accountAuthToken = await (
      await generateAuthTokenFromAccount(existingAccount)
    ).create()

    return rep.status(200).send({
      auth_token: accountAuthToken.serialize(),
      account: existingAccount.serialize(),
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
