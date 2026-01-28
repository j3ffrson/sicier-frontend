import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { setAuth } from '../../store/authStore'
import { authApi } from '../../api/authApi'
import API_BASE_URL from '../../api/config'
import { AuroraBackground } from '../../components/ui/aurora-background'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  function resolveErrorMessage(error) {
    if (error?.code === 'ECONNABORTED') {
      return `Tiempo de espera agotado en el servidor. URL: ${API_BASE_URL}`
    }
    if (error?.response?.status === 401) return 'Credenciales incorrectas.'
    if (error?.response?.status === 403) return 'No tienes permisos para acceder.'
    return `Credenciales incorrectas o backend no disponible. URL: ${API_BASE_URL}`
  }

  async function handleAuthSuccess(response, usernameInput) {
    if (!response?.jwt) return false

    const isAdmin = usernameInput === 'ADMIN' || usernameInput === 'admin@fesc.edu.co'
    
    // Guardamos username y areaId para los WebSockets
    // Usamos response.username si existe (preferible), o el input del usuario
    const finalUsername = response.username || usernameInput

    setAuth({
      token: response.jwt,
      role: isAdmin ? 'ADMIN' : 'FUNC',
      name: finalUsername,
      email: usernameInput,
      username: finalUsername, // Guardamos explícitamente para WebSockets
      id: response.id,
      areaId: response.areaId,
    })

    nav('/dashboard', { replace: true })
    return true
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')

    if (!email || !pass) {
      setErr('Ingrese usuario y contrasena.')
      return
    }

    setLoading(true)

    try {
      const response = await authApi.login(email, pass)
      const ok = await handleAuthSuccess(response, email)
      if (ok) return

      setErr(response?.message || 'Credenciales incorrectas.')
    } catch (error) {
      setErr(resolveErrorMessage(error))
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuroraBackground>
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-2xl border bg-white/90 p-6 shadow-xl backdrop-blur"
            style={{ borderColor: 'var(--fesc-border)' }}
          >
            <h1 className="mb-1 text-2xl font-bold">Iniciar sesion</h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--fesc-muted)' }}>
              Sistema de Peticiones - FESC
            </p>

            {err && (
              <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Usuario</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 outline-none"
                  style={{ borderColor: 'var(--fesc-border)' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contrasena</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border px-3 py-2 outline-none"
                  style={{ borderColor: 'var(--fesc-border)' }}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="********"
                />
              </div>

              <button
                className="w-full rounded-lg py-2 font-medium text-white disabled:opacity-70"
                style={{ background: 'var(--fesc-primary)' }}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  )
}
