export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginationLinks {
  first: string
  last: string
  prev: string | null
  next: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  links: PaginationLinks
}

export function buildPaginatedResponse<T>(
  items: T[],
  page: number,
  perPage: number,
  baseUrl: string,
  extraParams: Record<string, string | number | undefined> = {}
): PaginatedResponse<T> {
  const total = items.length
  const limit = Math.min(Math.max(perPage, 1), 50)
  const lastPage = Math.ceil(total / limit) || 1
  const currentPage = Math.min(Math.max(page, 1), lastPage)
  
  const start = (currentPage - 1) * limit
  const paginatedItems = items.slice(start, start + limit)

  // Construct query string
  const queryObj: Record<string, string> = {}
  Object.entries(extraParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      queryObj[k] = String(v)
    }
  })

  const getUrl = (p: number) => {
    const params = new URLSearchParams({
      ...queryObj,
      page: String(p),
      per_page: String(limit)
    })
    return `${baseUrl}?${params.toString()}`
  }

  return {
    data: paginatedItems,
    meta: {
      current_page: currentPage,
      last_page: lastPage,
      per_page: limit,
      total
    },
    links: {
      first: getUrl(1),
      last: getUrl(lastPage),
      prev: currentPage > 1 ? getUrl(currentPage - 1) : null,
      next: currentPage < lastPage ? getUrl(currentPage + 1) : null
    }
  }
}
export type { PaginationMeta, PaginationLinks, PaginatedResponse }
