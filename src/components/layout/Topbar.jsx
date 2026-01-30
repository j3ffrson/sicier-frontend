import { useNavigate } from 'react-router-dom'
import { clearAuth, getAuth } from '../../store/authStore'

// Icons
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
)

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
)

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </svg>
)

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
)

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </svg>
)

export default function Topbar({ onMenuClick }) {
  const nav = useNavigate()
  const auth = getAuth()

  function logout() {
    clearAuth()
    nav('/login', { replace: true })
  }

  const initials = auth?.name
    ? auth.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header
      className="flex items-center gap-4 px-4 bg-white border-b"
      style={{
        height: 'var(--topbar-height)',
        borderColor: 'var(--fesc-border)',
      }}
    >
      {/* Left Section - Menu & Logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="icon-btn"
          title="Menú principal"
        >
          <MenuIcon />
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => nav('/dashboard')}>
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--fesc-primary)' }}
          >
            P
          </div>
          <span className="text-lg font-medium hidden sm:block" style={{ color: 'var(--fesc-text-secondary)' }}>
            Peticiones
          </span>
        </div>
      </div>

      {/* Center Section - Search Bar */}
      <div className="flex-1 flex justify-center px-4">
        <div className="search-bar">
          <SearchIcon />
          <input
            type="text"
            placeholder="Buscar en peticiones"
          />
        </div>
      </div>

      {/* Right Section - Actions & User */}
      <div className="flex items-center gap-1">
        <button className="icon-btn" title="Soporte">
          <HelpIcon />
        </button>
        <button className="icon-btn" title="Configuración">
          <SettingsIcon />
        </button>

        <div className="relative ml-2 group">
          <div
            className="avatar cursor-pointer"
            title={auth?.name || 'Usuario'}
          >
            {initials}
          </div>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" style={{ borderColor: 'var(--fesc-border)' }}>
            <div 
              className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors" 
              style={{ borderColor: 'var(--fesc-border)' }}
              onClick={() => nav('/profile')}
            >
              <div className="flex items-center gap-3">
                <div className="avatar w-12 h-12 text-lg">{initials}</div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--fesc-text)' }}>
                    {auth?.name || 'Usuario'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--fesc-muted)' }}>
                    {auth?.email || 'correo@fesc.edu.co'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-2 space-y-1">
              <button
                onClick={() => nav('/profile')}
                className="w-full text-left px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-3"
                style={{ color: 'var(--fesc-text)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fesc-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ProfileIcon />
                Mi Perfil
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-3"
                style={{ color: 'var(--fesc-text)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fesc-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <LogoutIcon />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
