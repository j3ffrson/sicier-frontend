import { useCallback, useEffect, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { useNavigate } from 'react-router-dom'
import { informApi } from '../../api/informApi'
import { auditApi } from '../../api/auditApi'
import { normalizeRequestList } from '../../utils/requestMapper'
import { getRole } from '../../store/authStore'

// Icons
const InboxIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5v-3h3.56c.69 1.19 1.97 2 3.45 2s2.75-.81 3.45-2H19v3zm0-5h-4.99c0 1.1-.9 2-2 2s-2-.9-2-2H5V5h14v9z" />
  </svg>
)

const PendingIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
)

const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
)

function StatCard({ icon: Icon, label, value, description, color, onClick }) {
  return (
    <div
      className="stat-card cursor-pointer"
      onClick={onClick}
    >
      <div
        className="icon"
        style={{ background: `${color}15`, color: color }}
      >
        <Icon />
      </div>
      <p className="label">{label}</p>
      <p className="value">{value}</p>
      <p className="description">{description}</p>
    </div>
  )
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all hover:bg-[var(--fesc-hover)]"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'var(--fesc-primary-light)', color: 'var(--fesc-primary)' }}
      >
        <Icon />
      </div>
      <span className="font-medium" style={{ color: 'var(--fesc-text)' }}>{label}</span>
    </button>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ received: 0, pending: 0, answered: 0, sent: 0 })
  const [activities, setActivities] = useState([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const role = getRole()
  const isAdmin = role === 'ADMIN' || role === 'admin'

  const loadData = useCallback(async () => {
    try {
      // Cargar estadísticas
      const [inboxData, pendingData, answeredData, sentData] = await Promise.all([
        informApi.listByAreaState('RECIBIDO'),
        informApi.listByAreaState('OBSERVADO'),
        informApi.listByAreaState('APROBADO'),
        informApi.listByUser(0, 50),
      ])

      setStats({
        received: normalizeRequestList(inboxData).length,
        pending: normalizeRequestList(pendingData).length,
        answered: normalizeRequestList(answeredData).length,
        sent: normalizeRequestList(sentData).length,
      })

      // Cargar actividad reciente solo si es admin
      if (isAdmin) {
        setLoadingActivities(true)
        try {
          const operations = await auditApi.listOperations()
          // Asumimos que operations es una lista. Tomamos los últimos 5.
          const recentOps = Array.isArray(operations) ? operations.slice(0, 5) : []
          setActivities(recentOps)
        } catch (auditError) {
          console.error('Error loading audit operations:', auditError)
        } finally {
          setLoadingActivities(false)
        }
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err)
    }
  }, [isAdmin])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Helper para formatear fecha (asumiendo formato YYYY-MM-DD HH:mm:ss)
  const formatDate = (dateString) => {
    if (!dateString) return ''
    // Si la fecha ya viene formateada legible, la devolvemos tal cual, o intentamos parsearla
    return dateString
  }

  return (
    <AppShell>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-2" style={{ color: 'var(--fesc-text)' }}>
            Buenos dias
          </h1>
          <p style={{ color: 'var(--fesc-muted)' }}>
            Aqui tiene un resumen de su actividad de informes
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={InboxIcon}
            label="Recibidos"
            value={stats.received}
            description="Total de informes entrantes"
            color="#1a73e8"
            onClick={() => navigate('/requests/inbox')}
          />
          <StatCard
            icon={PendingIcon}
            label="Pendientes"
            value={stats.pending}
            description="Informes sin respuesta"
            color="#ea8600"
            onClick={() => navigate('/requests/inbox')}
          />
          <StatCard
            icon={CheckIcon}
            label="Respondidos"
            value={stats.answered}
            description="Informes finalizados"
            color="#34a853"
            onClick={() => navigate('/requests/history')}
          />
          <StatCard
            icon={SendIcon}
            label="Enviados"
            value={stats.sent}
            description="Informes que ha enviado"
            color="var(--fesc-primary)"
            onClick={() => navigate('/requests/sent')}
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
          {/* Quick Actions */}
          <div
            className="bg-white rounded-xl border p-4"
            style={{ borderColor: 'var(--fesc-border-light)' }}
          >
            <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--fesc-text)' }}>
              Acciones rapidas
            </h2>
            <div className="space-y-1">
              <QuickAction
                icon={() => (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                )}
                label="Nuevo informe"
                onClick={() => navigate('/reports/new')}
              />
              <QuickAction
                icon={InboxIcon}
                label="Ver recibidas"
                onClick={() => navigate('/requests/inbox')}
              />
              <QuickAction
                icon={() => (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                  </svg>
                )}
                label="Ver graficas"
                onClick={() => navigate('/analytics/charts')}
              />
            </div>
          </div>

          {/* Recent Activity - Only for Admin */}
          {isAdmin && (
            <div
              className="lg:col-span-2 bg-white rounded-xl border p-4"
              style={{ borderColor: 'var(--fesc-border-light)' }}
            >
              <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--fesc-text)' }}>
                Actividad reciente (Auditoría)
              </h2>
              <div className="space-y-3">
                {loadingActivities ? (
                  <p className="text-sm text-gray-500 text-center py-4">Cargando actividad...</p>
                ) : activities.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No hay actividad reciente</p>
                ) : (
                  activities.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer hover:bg-[var(--fesc-hover)]"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: 'var(--fesc-primary)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: 'var(--fesc-text)' }}>
                          {item.operation} - {item.objectName}
                        </p>
                        <p className="text-sm truncate" style={{ color: 'var(--fesc-muted)' }}>
                          Usuario: {item.username}
                        </p>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--fesc-muted)' }}>
                        {formatDate(item.date)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
