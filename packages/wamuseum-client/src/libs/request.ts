// eslint-disable-next-line no-undef
const request = async (path: string, init?: RequestInit) =>
  // eslint-disable-next-line no-return-await
  await fetch(`http://localhost:8001${path}`, init)

export default request
