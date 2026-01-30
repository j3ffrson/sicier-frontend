import { useState, useEffect, useCallback } from 'react'
import AppShell from '../../components/layout/AppShell'
import { authApi } from '../../api/authApi'

const initialForm = {
  id: null,
  firstName: '',
  lastName: '',
  identifier: '',
  institutionalEmail: '',
  username: '',
  password: '',
  area: '',
  phone: '',
  role: 'FUNC',
}

export default function Users() {
  const [form, setForm] = useState(initialForm)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoadingList(true)
    try {
      const data = await authApi.listUser()
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  function handleEdit(user) {
    setForm({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      identifier: user.identifier,
      institutionalEmail: user.institutionalEmail,
      username: user.username,
      password: '', // Password is usually not sent back, leave empty or handle separately
      area: user.area?.name || '', // Assuming area is an object in listUser response
      phone: user.phone,
      role: 'FUNC', // Default, or extract from user roles if available
    })
    setIsEditing(true)
    setMensaje('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setForm(initialForm)
    setIsEditing(false)
    setMensaje('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Basic validation
    if (!form.firstName || !form.lastName || !form.username || !form.institutionalEmail || !form.identifier || !form.area) {
      setMensaje('Por favor complete los campos obligatorios')
      return
    }

    if (!isEditing && !form.password) {
      setMensaje('La contraseña es obligatoria para nuevos usuarios')
      return
    }

    setLoading(true)
    setMensaje('')

    try {
      const userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        institutionalEmail: form.institutionalEmail,
        identifier: parseInt(form.identifier, 10),
        phone: parseInt(form.phone, 10) || 0,
        username: form.username,
        area: form.area,
        roleRequest: {
          roleList: [form.role],
        },
      }

      // Only include password if it's provided (for updates) or required (for creation)
      if (form.password) {
        userData.password = form.password
      }

      if (isEditing) {
        await authApi.updateUser(form.id, userData)
        setMensaje('Usuario actualizado correctamente')
      } else {
        await authApi.register(userData)
        setMensaje('Usuario creado correctamente')
      }

      loadUsers() // Refresh list
      if (!isEditing) {
        setForm(initialForm)
      } else {
        // Optional: Clear password field after update
        setForm(prev => ({ ...prev, password: '' }))
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setMensaje(''), 3000)

    } catch (error) {
      setMensaje(error.response?.data?.message || 'Error al procesar la solicitud')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const inputStyles = {
    borderColor: 'var(--fesc-border)',
    background: 'var(--fesc-surface)',
  }

  const labelStyles = {
    color: 'var(--fesc-text)',
  }

  return (
    <AppShell>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-2" style={{ color: 'var(--fesc-text)' }}>
            Gestión de Usuarios
          </h1>
          <p style={{ color: 'var(--fesc-muted)' }}>
            Cree, edite y administre los usuarios del sistema
          </p>
        </div>

        {/* Form Card */}
        <div
          className="bg-white rounded-xl border p-6 mb-8"
          style={{ borderColor: 'var(--fesc-border-light)' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium" style={{ color: 'var(--fesc-text)' }}>
              {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            {isEditing && (
              <button 
                onClick={handleCancelEdit}
                className="text-sm text-red-600 hover:underline"
              >
                Cancelar Edición
              </button>
            )}
          </div>

          {mensaje && (
            <div
              className={`mb-6 rounded-lg px-4 py-3 text-sm ${
                mensaje.includes('correctamente')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {mensaje}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium" style={labelStyles}>
                  Nombres *
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3 outline-none transition-colors focus:border-[var(--fesc-primary)]"
                  style={inputStyles}
                  placeholder="Ej: Juan"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" style={labelStyles}>
                  Apellidos *
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3 outline-none transition-colors focus:border-[var(--fesc-primary)]"
                  style={inputStyles}
                  placeholder="Ej: Perez"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" style={labelStyles}>
                  Cédula *
                </label>
                <input
                  name="identifier"
                  value={form.identifier}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3 outline-none transition-colors focus:border-[var(--fesc-primary)]"
                  style={inputStyles}
                  placeholder="Ej: 1090123456"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" style={labelStyles}>
                  Correo Institucional *
                </label>
                <input
                  type="email"
                  name="institutionalEmail"
                  value={form.institutionalEmail}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3 outline-none transition-colors focus:border-[var(--fesc-primary)]"
                  style={inputStyles}
                  placeholder="correo@fesc.edu.co"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" style={labelStyles}>
                  Usuario *
                </label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3 outline-none transition-colors focus:border-[var(--fesc-primary)]"
                  style={inputStyles}
                  placeholder="Ej: juanperez"
                  disabled={isEditing} // Usually username cannot be changed easily
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" style={labelStyles}>
                  Contraseña {isEditing ? '(Opcional)' : '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3 outline-none transition-colors focus:border-[var(--fesc-primary)]"
                  style={inputStyles}
                  placeholder={isEditing ? "Dejar en blanco para mantener" : "Ingrese contraseña"}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" style={labelStyles}>
                  Área / Dependencia *
                </label>
                <input
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3 outline-none transition-colors focus:border-[var(--fesc-primary)]"
                  style={inputStyles}
                  placeholder="Ej: Rectoria"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" style={labelStyles}>
                  Teléfono
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3 outline-none transition-colors focus:border-[var(--fesc-primary)]"
                  style={inputStyles}
                  placeholder="Ej: 3001234567"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" style={labelStyles}>
                  Rol
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3 outline-none transition-colors focus:border-[var(--fesc-primary)]"
                  style={inputStyles}
                >
                  <option value="FUNC">Funcionario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setForm(initialForm)}
                  className="rounded-lg px-6 py-3 font-medium transition-colors hover:bg-[var(--fesc-hover)]"
                  style={{ color: 'var(--fesc-text)' }}
                >
                  Limpiar
                </button>
              )}
              <button
                type="submit"
                className="rounded-lg px-6 py-3 font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--fesc-primary)' }}
                disabled={loading}
              >
                {loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Usuario' : 'Crear Usuario')}
              </button>
            </div>
          </form>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: 'var(--fesc-border-light)' }}>
          <div className="p-6 border-b" style={{ borderColor: 'var(--fesc-border-light)' }}>
            <h2 className="text-lg font-medium" style={{ color: 'var(--fesc-text)' }}>
              Lista de Usuarios
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                <tr>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Área</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingList ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.username}</td>
                      <td className="px-6 py-4 text-gray-600">{user.institutionalEmail}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.area?.name || user.area || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
