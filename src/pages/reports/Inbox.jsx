import { useCallback, useEffect, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import RequestRow from '../../components/ui/RequestRow'
import RequestDetail from '../../components/ui/RequestDetail'
import { informApi } from '../../api/informApi'
import { normalizeRequestList } from '../../utils/requestMapper'

// Icons
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
  </svg>
)

const MoreIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
)

export default function Inbox() {
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadInbox = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [userData, areaData] = await Promise.all([
        informApi.listByUserState('RECIBIDO'),
        informApi.listByAreaState('RECIBIDO'),
      ])

      const list = [
        ...normalizeRequestList(userData),
        ...normalizeRequestList(areaData),
      ]

      const unique = Array.from(
        new Map(list.map((item) => [item.id, item])).values()
      )

      setRequests(unique)
    } catch (err) {
      console.error('Error loading inbox:', err)
      setError('No se pudo cargar la bandeja de entrada de informes.')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInbox()
  }, [loadInbox])

  const handleSelect = (id, selected) => {
    console.log('Selected:', id, selected)
  }

  const handleStar = (id, starred) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, starred } : r)))
  }

  const handleClick = (id) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, unread: false } : r)))
    const request = requests.find((r) => r.id === id)
    setSelectedRequest(request)
  }

  const handleBack = () => {
    setSelectedRequest(null)
  }

  return (
    <AppShell>
      {selectedRequest ? (
        <RequestDetail request={selectedRequest} onBack={handleBack} />
      ) : (
        <div className="h-full flex flex-col">
          {/* Toolbar */}
          <div
            className="flex items-center gap-2 px-4 py-2 border-b bg-white"
            style={{ borderColor: 'var(--fesc-border)' }}
          >
            <input
              type="checkbox"
              className="w-[18px] h-[18px] cursor-pointer accent-[var(--fesc-primary)]"
            />
            <button className="action-btn" title="Actualizar" onClick={loadInbox}>
              <RefreshIcon />
            </button>
            <button className="action-btn" title="Mas opciones">
              <MoreIcon />
            </button>

            <div className="flex-1" />

            <span className="text-sm" style={{ color: 'var(--fesc-muted)' }}>
              {requests.length === 0 ? '0' : `1-${requests.length}`} de {requests.length}
            </span>
          </div>

          {error && (
            <div className="px-4 py-2 text-sm bg-yellow-50 text-yellow-800 border-b" style={{ borderColor: 'var(--fesc-border)' }}>
              {error}
            </div>
          )}

          {/* Request List */}
          <div className="flex-1 overflow-y-auto bg-white">
            {loading && requests.length === 0 && (
              <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'var(--fesc-muted)' }}>
                Cargando...
              </div>
            )}

            {requests.map((request) => (
              <RequestRow
                key={request.id}
                {...request}
                onSelect={handleSelect}
                onStar={handleStar}
                onClick={handleClick}
              />
            ))}

            {!loading && requests.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-lg font-medium" style={{ color: 'var(--fesc-text)' }}>
                  No hay informes recibidos
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--fesc-muted)' }}>
                  Los informes que reciba aparecerán aquí
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
