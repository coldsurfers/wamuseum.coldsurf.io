import { FastifyError, RouteHandler } from 'fastify'

export const getMeCtrl: RouteHandler<{}> = async (req, rep) => {
  try {
    return rep.status(501).send()
  } catch (e) {
    const error = e as FastifyError
    return rep.status(error.statusCode ?? 500).send(error)
  }
}
