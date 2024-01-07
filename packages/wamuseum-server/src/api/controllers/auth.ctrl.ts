import { FastifyError, RouteHandler } from 'fastify'
import User from '../models/User'
import AuthToken from '../models/AuthToken'
import encryptPassword from '../../lib/encryptPassword'
import { JWTDecoded } from '../../types/jwt'

export const postRegisterCtrl: RouteHandler<{
  Body: {
    username: string
    email: string
    password: string
  }
}> = async (req, rep) => {
  const { username, email, password } = req.body
  if (!username || !email || !password) {
    return rep.status(400).send({})
  }
  try {
    let user = await User.find({
      email,
      username,
    })
    if (user) {
      return rep.status(409).send({})
    }
    const { encrypted, salt } = encryptPassword({
      plain: password,
      originalSalt: undefined,
    })
    user = await new User({
      email,
      username,
      password: encrypted,
      passwordSalt: salt,
    }).create()
    if (!user || !user.id) {
      return rep.status(404).send({})
    }
    const authToken = new AuthToken({
      auth_token: await rep.jwtSign(
        {
          email: user.email,
          username: user.username,
          id: user.id,
        },
        {
          expiresIn: '7d',
        }
      ),
      refresh_token: await rep.jwtSign(
        {
          email: user.email,
          username: user.username,
          id: user.id,
        },
        {
          expiresIn: '30d',
        }
      ),
      user_id: user.id,
    })
    const { refresh_token, auth_token } = await authToken.create()

    return rep.status(200).send({
      refresh_token,
      token: auth_token,
      user: user.serialize(),
    })
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}

export const postLoginCtrl: RouteHandler<{
  Body: {
    username: string
    password: string
  }
}> = async (req, rep) => {
  const { username, password } = req.body
  if (!username || !password) {
    return rep.status(400).send({})
  }
  try {
    const user = await User.find({
      username,
    })
    if (!user || !user.id) {
      return rep.status(403).send({})
    }
    if (
      user.password !==
      encryptPassword({ plain: password, originalSalt: user.passwordSalt })
        .encrypted
    ) {
      return rep.status(403).send({})
    }
    const authToken = new AuthToken({
      auth_token: await rep.jwtSign(
        {
          email: user.email,
          username: user.username,
          id: user.id,
        },
        {
          expiresIn: '7d',
        }
      ),
      refresh_token: await rep.jwtSign(
        {
          email: user.email,
          username: user.username,
          id: user.id,
        },
        {
          expiresIn: '30d',
        }
      ),
      user_id: user.id,
    })
    const { refresh_token, auth_token } = await authToken.create()

    return rep.status(200).send({
      user: user.serialize(),
      token: auth_token,
      refresh_token,
    })
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}

export const getUserCtrl: RouteHandler<{}> = async (req, rep) => {
  try {
    const decoded = (await req.jwtDecode()) as JWTDecoded
    const user = await User.find({
      email: decoded.email,
      username: decoded.username,
    })

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

export const postLogoutCtrl: RouteHandler<{}> = async (req, rep) => {
  try {
    // await req.jwtVerify();
    const decoded = (await req.jwtDecode()) as JWTDecoded
    const user = await User.find({
      email: decoded.email,
      username: decoded.username,
    })
    if (!user || !user.id) return rep.status(403).send()
    await AuthToken.deleteByUserId(user.id)
    return rep.status(204).send()
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}

export const patchUserProfileCtrl: RouteHandler<{
  Body:
    | {
        category: 'password'
        password: string
        passwordCheck: string
      }
    | {
        category: 'email'
        email: string
      }
}> = async (req, rep) => {
  const { category } = req.body
  try {
    const decoded = (await req.jwtDecode()) as JWTDecoded

    switch (category) {
      case 'email':
        // eslint-disable-next-line no-case-declarations
        const updated = await User.changeEmail({
          userId: decoded.id,
          email: req.body.email,
        })
        if (!updated.id) return rep.status(403).send()
        // eslint-disable-next-line no-case-declarations
        const authToken = new AuthToken({
          auth_token: await rep.jwtSign(
            {
              email: updated.email,
              username: updated.username,
              id: updated.id,
            },
            {
              expiresIn: '7d',
            }
          ),
          refresh_token: await rep.jwtSign(
            {
              email: updated.email,
              username: updated.username,
              id: updated.id,
            },
            {
              expiresIn: '30d',
            }
          ),
          user_id: updated.id,
        })
        return rep.status(200).send({
          user: updated.serialize(),
          token: authToken.auth_token,
          refresh_token: authToken.refresh_token,
        })
      case 'password':
        if (req.body.password !== req.body.passwordCheck) {
          return rep.status(400).send()
        }
        // eslint-disable-next-line no-case-declarations
        const user = await User.find({
          username: decoded.username,
        })
        if (!user || !user.id) return rep.status(404).send()
        // eslint-disable-next-line no-case-declarations
        const { encrypted, salt } = encryptPassword({
          plain: req.body.password,
          originalSalt: user.passwordSalt,
        })
        // eslint-disable-next-line no-case-declarations
        const passwordChangedUser = await User.changePassword({
          userId: user.id,
          password: encrypted,
          passwordSalt: salt,
        })
        return rep.status(200).send({
          user: passwordChangedUser.serialize(),
        })
      default:
        break
    }

    return rep.status(501).send()
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}
