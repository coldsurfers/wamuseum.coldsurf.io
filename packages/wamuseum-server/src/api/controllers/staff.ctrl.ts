import { FastifyError, RouteHandler } from 'fastify'
import Staff from '../models/Staff'
import { JWTDecoded } from '../../types/jwt'

export const getStaffListCtrl: RouteHandler<{
  Querystring: {
    page?: string
  }
}> = async (req, rep) => {
  try {
    const { page: _page } = req.query
    const numberfiedPage = _page ? +_page : 1
    const page = Number.isNaN(numberfiedPage) ? 1 : numberfiedPage
    const perPage = 10

    const list = await Staff.list({
      skip: (page - 1) * perPage,
      take: perPage,
    })
    const serialized = list.map((each) => each.serialize())
    return rep.status(200).send(serialized)
  } catch (e) {
    const error = e as FastifyError
    return rep.status(500).send(error)
  }
}

export const getStaffDetailCtrl: RouteHandler<{}> = async (req, rep) => {
  try {
    const result = (await req.jwtDecode()) as JWTDecoded
    const { id: accountId } = result
    const detail = await Staff.findByAccountId(accountId)
    if (!detail) {
      return rep.status(404).send()
    }
    const serialized = detail.serialize()
    return rep.status(200).send(serialized)
  } catch (e) {
    const error = e as FastifyError
    return rep.status(500).send(error)
  }
}

export const postStaffAuthorizeCtrl: RouteHandler<{
  Params: {
    staffId: string
  }
}> = async (req, rep) => {
  try {
    const { staffId } = req.params
    const staff = await Staff.authorizeByStaffId(staffId)
    return rep.status(200).send(staff)
  } catch (e) {
    const error = e as FastifyError
    return rep.status(500).send(error)
  }
}
