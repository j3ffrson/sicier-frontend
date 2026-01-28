const KEY = 'fesc_auth'

export function getAuth() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAuth(auth) {
  localStorage.setItem(KEY, JSON.stringify(auth))
}

export function clearAuth() {
  localStorage.removeItem(KEY)
}

export function isLoggedIn() {
  return !!getAuth()?.token
}

export function getRole() {
  return getAuth()?.role || null
}

export function getUserId() {
  return getAuth()?.id || null
}

export function getUsername() {
  return getAuth()?.username || null
}

export function getAreaId() {
  return getAuth()?.areaId || null
}
