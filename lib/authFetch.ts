export function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token') || localStorage.getItem('Authorization')
      : null

  const headers = new Headers(init.headers || {})
  if (token) {
    headers.set('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`)
  }

  return fetch(input, {
    ...init,
    credentials: 'include',
    headers,
  })
}

