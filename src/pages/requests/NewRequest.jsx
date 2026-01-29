import { useState, useCallback, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell'
import ComposeModal from '../../components/ui/ComposeModal'
import RequestRow from '../../components/ui/RequestRow'
import { requestApi } from '../../api/requestApi'
import { informApi } from '../../api/informApi' // Placeholder for listing requests
import { normalizeRequestList } from '../../utils/requestMapper'

function parseDestination(input) {
  const value = input.trim()
  if (!value) return null

  const lower = value.toLowerCase()
  if (lower.startsWith('area:')) {
    const id = Number(value.slice(5).trim())
    return Number.isNaN(id) ? null : { type: 'area', id }
  }

  if (lower.startsWith('user:')) {
    const id = Number(value.slice(5).trim())
    return Number.isNaN(id) ? null : { type: 'user', id }
  }

  const numeric = Number(value)
  if (!Number.isNaN(numeric)) {
    return { type: 'area', id: numeric }
  }

  return null
}

const requestPlaceholders = {
  title: 'Nueva Petición',
  to: 'Destinatario (ej: area:3)',
  subject: 'Asunto de la petición',
  body: 'Escriba el contenido de la petición aquí...',
}

export default function NewRequest() {
  const [showModal, setShowModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)

  const loadSentRequests = useCallback(async () => {
    setLoading(true)
    try {
      // TODO: Replace with a real requestApi endpoint when available
      const data = await informApi.listByUser(0, 50)
      const list = normalizeRequestList(data)
      setRequests(list)
    } catch (err) {
      console.error('Error loading sent requests:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSentRequests()
  }, [loadSentRequests])

  const handleSend = async (data) => {
    const destination = parseDestination(data.to)

    if (!destination) {
      alert('Use formato area:ID o user:ID (ej: area:3)')
      return
    }

    setSending(true)
    try {
      const requestData = {
        title: data.subject,
        description: data.body,
      }

      if (destination.type === 'area') {
        // Corrección: areaDestId debe ser un array, igual que userDestId
        await requestApi.createToArea({ 
          ...requestData, 
          areaDestId: destination.id
        })
      } else {
        // Corrección: userDestId debe ser un array
        await requestApi.createToUser({ 
          ...requestData, 
          userDestId: destination.id
        })
      }

      setShowModal(false)
      loadSentRequests() // Refresh the list
    } catch (err) {
      console.error('Error sending request:', err)
      alert('No se pudo enviar la petición.')
    } finally {
      setSending(false)
    }
  }

  return (
    <AppShell>
      <div className="p-8">
        <div className="text-center max-w-lg mx-auto mb-12">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--fesc-primary-light)' }}
          >
            <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--fesc-primary)">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2" style={{ color: 'var(--fesc-text)' }}>
            Nueva Petición
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--fesc-muted)' }}>
            Redacte una solicitud de informe. Sus peticiones enviadas recientemente aparecerán a continuación.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-lg font-medium text-white"
            style={{ background: 'var(--fesc-primary)' }}
          >
            Redactar Nueva Petición
          </button>
        </div>

        <div className="bg-white rounded-xl border" style={{ borderColor: 'var(--fesc-border-light)' }}>
          <h3 className="text-lg font-medium p-4 border-b" style={{ color: 'var(--fesc-text)', borderColor: 'var(--fesc-border-light)' }}>
            Peticiones Enviadas Recientemente
          </h3>
          <div className="flex-1 overflow-y-auto">
            {loading && requests.length === 0 && (
              <div className="p-8 text-center text-sm" style={{ color: 'var(--fesc-muted)' }}>
                Cargando peticiones...
              </div>
            )}
            {requests.map((request) => (
              <RequestRow key={request.id} {...request} />
            ))}
            {!loading && requests.length === 0 && (
              <div className="p-8 text-center">
                <p className="font-medium" style={{ color: 'var(--fesc-text)' }}>
                  No ha enviado peticiones
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--f-muted)' }}>
                  Cuando envíe una petición, aparecerá aquí.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ComposeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSend={handleSend}
        isSending={sending}
        placeholders={requestPlaceholders}
      />
    </AppShell>
  )
}
