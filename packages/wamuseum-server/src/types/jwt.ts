export type JWTDecoded = {
  email: string
  username: string
  id: string
  iat: number
  exp: number
}

export type JWTPayload = {
  email: string
  username: string
  id: string
}
