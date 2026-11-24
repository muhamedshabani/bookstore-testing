import { useCallback, useEffect, useState } from 'react'

// Loads data from an API call and exposes loading/error state plus a reload function.
// `deps` re-runs the call when they change (e.g. a route id).
export function useApi(load, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps)

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }))
    return run()
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => setState({ data: null, error, loading: false }))
  }, [run])

  useEffect(() => {
    let cancelled = false
    run()
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((error) => !cancelled && setState({ data: null, error, loading: false }))
    return () => {
      cancelled = true
    }
  }, [run])

  return { ...state, reload }
}
