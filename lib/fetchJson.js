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
    /* An admin API returning 401 means the session cookie is missing, expired
       or no longer valid (e.g. the JWT secret rotated after a redeploy).
       Instead of a dead-end "Unauthorized" banner, send the admin to sign-in
       and return them to the current page afterwards. */
    if (
      res.status === 401 &&
      typeof window !== 'undefined' &&
      typeof url === 'string' &&
      url.startsWith('/api/admin') &&
      !window.location.pathname.startsWith('/admin/login')
    ) {
      const from = window.location.pathname + window.location.search
      window.location.href = `/admin/login?from=${encodeURIComponent(from)}&expired=1`
      message = 'Your session has expired. Redirecting to sign-in…'
    }
    throw new Error(message)
  }
  return res.json()
}
