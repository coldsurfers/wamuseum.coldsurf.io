export function parseQuerystringPage(queryStringPage?: string) {
  // eslint-disable-next-line no-underscore-dangle
  const _page = queryStringPage
  const numberfiedPage = _page ? +_page : 1
  const page = Number.isNaN(numberfiedPage) ? 1 : numberfiedPage
  return page
}
