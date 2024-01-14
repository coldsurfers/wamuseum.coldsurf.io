import { FastifyError, RouteHandler } from 'fastify'
import Staff from '../models/Staff'

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
    return rep.status(200).send([])
  } catch (e) {
    const error = e as FastifyError
    return rep.status(500).send(error)
  }
}

export const postStaffAuthorizeCtrl: RouteHandler<{}> = async (req, rep) => {
  try {
    return rep.status(200).send([])
  } catch (e) {
    const error = e as FastifyError
    return rep.status(500).send(error)
  }
}
