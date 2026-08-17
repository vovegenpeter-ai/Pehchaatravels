export async function fetchJson(url, options) {
  const res = await fetch(url, options)
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
