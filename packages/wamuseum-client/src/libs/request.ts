const host = process.env.NODE_ENV === 'development' ? 'http://0.0.0.0:8001' : ''

// eslint-disable-next-line no-undef
const request = async (path: string, init?: RequestInit) =>
  // eslint-disable-next-line no-return-await
  await fetch(`${host}${path}`, init)

export default request
