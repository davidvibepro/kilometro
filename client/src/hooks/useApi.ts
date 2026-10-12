import { useCallback, useEffect, useState } from 'react'
import { toApiError, type ApiError } from '../api/axios'

// Loads data when the component mounts and whenever `request` changes.
// `request` must keep the same identity between renders: pass a request function
// directly (useApi(getOwners)) or wrap it in useCallback, otherwise it loads forever.
export function useApi<T>(request: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(true)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    // Set to true when a newer request starts, so a late answer from this one is ignored
    let ignore = false

    request()
      .then((result) => {
        if (ignore) return
        setData(result)
        setError(null)
      })
      .catch((err) => {
        if (!ignore) setError(toApiError(err))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [request, reloadCount])

  // Shows the loading state again and runs the request once more
  const refetch = useCallback(() => {
    setLoading(true)
    setReloadCount((count) => count + 1)
  }, [])

  return { data, loading, error, refetch }
}
