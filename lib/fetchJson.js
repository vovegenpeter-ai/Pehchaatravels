export async function fetchJson(url, options) {
  const { timeoutMs, ...fetchOptions } = options || {}
  const res = await fetch(url, {
    ...fetchOptions,
    ...(timeoutMs ? { signal: AbortSignal.timeout(timeoutMs) } : {}),
  })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data?.error) message = data.error
    } catch {
      // Non-JSON error body — keep the generic message
    }
    throw new Error(message)
  }
  return res.json()
}
