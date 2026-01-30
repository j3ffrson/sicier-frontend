import { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell'
import { authApi } from '../../api/authApi'
import { getRole } from '../../store/authStore'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const role = getRole()

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await authApi.userPerfil()
        setUser(data)
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('No se pudo cargar la información del perfil.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Cargando perfil...</p>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <div className="p-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </AppShell>
    )
  }

  if (!user) return null

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-2" style={{ color: 'var(--fesc-text)' }}>
            Mi Perfil
          </h1>
          <p style={{ color: 'var(--fesc-muted)' }}>
            Información personal y de cuenta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border p-6 text-center" style={{ borderColor: 'var(--fesc-border-light)' }}>
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white"
                style={{ background: 'var(--fesc-primary)' }}
              >
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-gray-500 mb-4">@{user.username}</p>
              
              <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {role === 'ADMIN' ? 'Administrador' : 'Funcionario'}
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border p-6" style={{ borderColor: 'var(--fesc-border-light)' }}>
              <h3 className="text-lg font-medium mb-6 border-b pb-2" style={{ borderColor: 'var(--fesc-border-light)' }}>
                Detalles de la Cuenta
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                      Identificación
                    </label>
                    <p className="text-gray-800 font-medium">{user.identifier}</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                      Teléfono
                    </label>
                    <p className="text-gray-800 font-medium">{user.phone || 'No registrado'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Correo Institucional
                  </label>
                  <p className="text-gray-800 font-medium">{user.institutionalEmail}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Área / Dependencia
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <p className="text-gray-800 font-medium">
                      {user.area?.name || user.area || 'Sin asignar'}
                    </p>
                  </div>
                  {user.area?.description && (
                    <p className="text-xs text-gray-500 mt-1 ml-4">
                      {user.area.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
