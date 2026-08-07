/**
 * Shared data-fetching hook for every module's list page: handles
 * pagination, search (debounced), sorting, filters, and loading/error state.
 */
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from './useDebounce'
import { extractErrorMessage } from '../services/api'

export function usePaginatedFetch(fetchFn, extraParams = {}, initialSort = { sort_by: null, sort_dir: 'asc' }) {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(initialSort)
  const [data, setData] = useState({ items: [], total: 0, total_pages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const debouncedSearch = useDebounce(search, 350)

  const extraKey = JSON.stringify(extraParams)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchFn({
        page, page_size: pageSize, search: debouncedSearch || undefined,
        sort_by: sort.sort_by || undefined, sort_dir: sort.sort_dir,
        ...JSON.parse(extraKey),
      })
      setData(res.data)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch, sort, extraKey])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [debouncedSearch, extraKey])

  const toggleSort = (field) => {
    setSort((prev) => ({
      sort_by: field,
      sort_dir: prev.sort_by === field && prev.sort_dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  return { data, isLoading, error, page, setPage, search, setSearch, sort, toggleSort, reload: load }
}
