import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { getRole } from '../../store/authStore'

// Icons as SVG components
const InboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5v-3h3.56c.69 1.19 1.97 2 3.45 2s2.75-.81 3.45-2H19v3zm0-5h-4.99c0 1.1-.9 2-2 2s-2-.9-2-2H5V5h14v9z"/>
  </svg>
)

const ReportInboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
  </svg>
)

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
)

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
  </svg>
)

const ReportHistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
)

const AuditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
  </svg>
)

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
)

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
  </svg>
)

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
)

const ComposeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

export default function Sidebar({ collapsed, onToggle }) {
  const role = getRole()
  const navigate = useNavigate()
  
  const navItems = [
    { label: 'Peticiones Recibidas', to: '/requests/inbox', icon: InboxIcon, count: 5 },
    { label: 'Informes Recibidos', to: '/reports/inbox', icon: ReportInboxIcon },
    { label: 'Enviadas', to: '/requests/sent', icon: SendIcon },
    { label: 'Historial Peticiones', to: '/requests/history', icon: HistoryIcon },
    { label: 'Historial Informes', to: '/reports/history', icon: ReportHistoryIcon },
    { label: 'Dashboard', to: '/dashboard', icon: DashboardIcon },
    { label: 'Actividad y Auditoría', to: '/analytics/charts', icon: AuditIcon },
  ]

  if (role === 'ADMIN' || role === 'admin') {
    navItems.push({ label: 'Usuarios', to: '/admin/users', icon: UsersIcon })
  }

  return (
    <aside
      className="flex flex-col bg-white transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        minWidth: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
      }}
    >
      {/* Compose Buttons */}
      <div className="p-3 space-y-2">
        <button
          onClick={() => navigate('/reports/new')}
          className="compose-btn w-full"
          style={{
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '14px' : '14px 24px 14px 16px',
          }}
        >
          <ComposeIcon />
          {!collapsed && <span>Nuevo Informe</span>}
        </button>
        <button
          onClick={() => navigate('/requests/new')}
          className="compose-btn w-full"
          style={{
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '14px' : '14px 24px 14px 16px',
            background: 'var(--fesc-secondary-bg)',
            color: 'var(--fesc-secondary-text)',
          }}
        >
          <ComposeIcon />
          {!collapsed && <span>Nueva Petición</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-2 pr-2">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className="block mb-1">
            {({ isActive }) => (
              <div
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{
                  paddingLeft: collapsed ? '24px' : '12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                title={collapsed ? item.label : undefined}
              >
                <item.icon />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.count && (
                      <span className="count">{item.count}</span>
                    )}
                  </>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 text-xs text-center" style={{ color: 'var(--fesc-muted)' }}>
          © FESC Cúcuta
        </div>
      )}
    </aside>
  )
}
