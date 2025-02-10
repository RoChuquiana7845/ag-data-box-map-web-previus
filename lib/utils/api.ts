const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type FetchOptions = {
  method?: string
  headers?: Record<string, string>
  body?: any
  token?: string
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { method = "GET", headers = {}, body, token } = options

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || "An error occurred")
  }

  return response.json()
}

