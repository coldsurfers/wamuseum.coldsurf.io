export type JWTDecoded = {
  email: string
  id: string
  iat: number
  exp: number
}

export type JWTPayload = {
  email: string
  id: string
}
