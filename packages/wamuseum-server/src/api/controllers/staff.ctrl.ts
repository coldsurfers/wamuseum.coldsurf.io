import { FastifyError, RouteHandler } from 'fastify'

export const getStaffListCtrl: RouteHandler<{
  Querystring: {
    page?: string
  }
}> = (req, rep) => {
  try {
    const { page: _page } = req.query
    const numberfiedPage = _page ? +_page : 1
    const page = isNaN(numberfiedPage) ? 1 : numberfiedPage
    const perPage = 10

    return rep.status(200).send()
  } catch (e) {
    const error = e as FastifyError
    return rep.status(500).send(error)
  }
}

export const getStaffDetailCtrl: RouteHandler<{}> = (req, rep) => {}

export const postStaffAuthorizeCtrl: RouteHandler<{}> = (req, rep) => {}
