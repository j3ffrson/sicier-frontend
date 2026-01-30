import { useCallback, useEffect, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { informApi } from '../../api/informApi'
import { requestApi } from '../../api/requestApi'
import { auditApi } from '../../api/auditApi'
import { authApi } from '../../api/authApi'
import { normalizeRequestList } from '../../utils/requestMapper'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function Charts() {
  const [stats, setStats] = useState(null)
  const [pieData, setPieData] = useState([])
  const [barData, setBarData] = useState([])
  const [operations, setOperations] = useState([])
  const [statesHistory, setStatesHistory] = useState([]) // Nueva tabla
  const [loading, setLoading] = useState(true)
  const [loadingTable, setLoadingTable] = useState(false)
  const [loadingStates, setLoadingStates] = useState(false)
  const [error, setError] = useState('')
  
  // Filtros
  const [filterType, setFilterType] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      // 1. Cargar datos para KPIs y Pie Chart
      const [
        inboxAreaReports,
        inboxUserReports,
        pendingReports,
        approvedReports,
        sentReports,
        receivedRequests,
        sentRequests
      ] = await Promise.all([
        informApi.listByAreaState('RECIBIDO'),
        informApi.listByUserState('RECIBIDO'),
        informApi.listByAreaState('OBSERVADO'),
        informApi.listByAreaState('APROBADO'),
        informApi.listByUser(0, 100),
        requestApi.listByUserDestination(0, 100),
        requestApi.listByUser(0, 100)
      ])

      const reportsReceived = [
        ...normalizeRequestList(inboxAreaReports),
        ...normalizeRequestList(inboxUserReports)
      ]
      const uniqueReportsReceived = Array.from(new Map(reportsReceived.map(item => [item.id, item])).values())
      const requestsReceived = normalizeRequestList(receivedRequests)
      const reportsSent = normalizeRequestList(sentReports)
      const requestsSent = normalizeRequestList(sentRequests)
      const reportsPending = normalizeRequestList(pendingReports)
      const reportsApproved = normalizeRequestList(approvedReports)

      const totalReceived = uniqueReportsReceived.length + requestsReceived.length
      const totalSent = reportsSent.length + requestsSent.length
      const totalPending = reportsPending.length
      const totalApproved = reportsApproved.length

      setStats({
        received: totalReceived,
        pending: totalPending,
        answered: totalApproved,
        sent: totalSent,
      })

      const pieStats = [
        { name: 'Informes Recibidos', value: uniqueReportsReceived.length },
        { name: 'Peticiones Recibidas', value: requestsReceived.length },
        { name: 'Informes Observados', value: totalPending },
        { name: 'Informes Aprobados', value: totalApproved },
      ]
      setPieData(pieStats.filter(item => item.value > 0))

      // 2. Cargar datos de Auditoría
      await loadAuditOperations()
      await loadStatesHistory()

    } catch (err) {
      console.error('Error loading charts data:', err)
      setError('No se pudieron cargar los datos de las gráficas.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAuditOperations = async () => {
    setLoadingTable(true)
    try {
      const ops = await auditApi.listOperations()
      if (Array.isArray(ops)) {
        const grouped = ops.reduce((acc, curr) => {
          const dateKey = curr.date ? curr.date.split(' ')[0] : 'Desconocido'
          acc[dateKey] = (acc[dateKey] || 0) + 1
          return acc
        }, {})

        const chartData = Object.keys(grouped)
          .sort()
          .slice(-7)
          .map(date => ({
            date,
            count: grouped[date]
          }))
        
        setBarData(chartData)
        setOperations(ops)
      }
    } catch (auditErr) {
      console.error('Error loading audit data:', auditErr)
    } finally {
      setLoadingTable(false)
    }
  }

  const loadStatesHistory = async () => {
    setLoadingStates(true)
    try {
      const states = await auditApi.listStates()
      if (!Array.isArray(states)) return

      // Recolectar IDs únicos para hacer fetch en lote
      const userIds = new Set()
      const informIds = new Set()
      const requestIds = new Set()

      states.forEach(s => {
        if (s.userId) userIds.add(s.userId)
        if (s.informId) informIds.add(s.informId)
        if (s.requestId) requestIds.add(s.requestId)
      })

      // Fetch de datos auxiliares
      const usersMap = {}
      const informsMap = {}
      const requestsMap = {}

      await Promise.all([
        // Usuarios
        Promise.all([...userIds].map(async id => {
          try {
            const u = await authApi.findById(id)
            usersMap[id] = `${u.firstName} ${u.lastName}`
          } catch (e) { usersMap[id] = `Usuario ${id}` }
        })),
        // Informes
        Promise.all([...informIds].map(async id => {
          try {
            const i = await informApi.getById(id)
            informsMap[id] = i.title || `Informe #${id}`
          } catch (e) { informsMap[id] = `Informe #${id}` }
        })),
        // Peticiones
        Promise.all([...requestIds].map(async id => {
          try {
            const r = await requestApi.getById(id)
            requestsMap[id] = r.title || `Petición #${id}`
          } catch (e) { requestsMap[id] = `Petición #${id}` }
        }))
      ])

      // Enriquecer la lista
      const enrichedStates = states.map(s => ({
        ...s,
        userName: usersMap[s.userId] || 'Desconocido',
        targetName: s.informId ? informsMap[s.informId] : (s.requestId ? requestsMap[s.requestId] : 'Desconocido'),
        targetType: s.informId ? 'Informe' : 'Petición'
      }))

      setStatesHistory(enrichedStates)

    } catch (err) {
      console.error('Error loading states history:', err)
    } finally {
      setLoadingStates(false)
    }
  }

  const handleFilter = async () => {
    setLoadingTable(true)
    try {
      let ops = []
      if (filterType) {
        ops = await auditApi.getOperationsByType(filterType)
      } else if (filterDate) {
        ops = await auditApi.getOperationsByDate(filterDate)
      } else {
        ops = await auditApi.listOperations()
      }
      setOperations(Array.isArray(ops) ? ops : [])
    } catch (err) {
      console.error('Error filtering operations:', err)
      setOperations([])
    } finally {
      setLoadingTable(false)
    }
  }

  const clearFilters = async () => {
    setFilterType('')
    setFilterDate('')
    await loadAuditOperations()
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-2" style={{ color: 'var(--fesc-text)' }}>
            Actividad y Auditoría
          </h1>
          <p style={{ color: 'var(--fesc-muted)' }}>
            Métricas del sistema y registro detallado de operaciones
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64 text-sm text-gray-500">
            Cargando datos...
          </div>
        ) : (
          <>
            {/* KPIs Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="stat-card bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: 'var(--fesc-border-light)' }}>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Recibidos</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.received}</p>
                  <p className="text-xs text-gray-400 mt-1">Informes + Peticiones</p>
                </div>
                <div className="stat-card bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: 'var(--fesc-border-light)' }}>
                  <p className="text-sm font-medium text-gray-500 mb-1">Observados</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-xs text-gray-400 mt-1">Informes en corrección</p>
                </div>
                <div className="stat-card bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: 'var(--fesc-border-light)' }}>
                  <p className="text-sm font-medium text-gray-500 mb-1">Aprobados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.answered}</p>
                  <p className="text-xs text-gray-400 mt-1">Informes finalizados</p>
                </div>
                <div className="stat-card bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: 'var(--fesc-border-light)' }}>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Enviados</p>
                  <p className="text-2xl font-bold text-[var(--fesc-primary)]">{stats.sent}</p>
                  <p className="text-xs text-gray-400 mt-1">Informes + Peticiones</p>
                </div>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: 'var(--fesc-border-light)' }}>
                <h3 className="text-lg font-medium mb-6 text-gray-800 border-b pb-2">Distribución de Carga</h3>
                <div className="h-80 w-full">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No hay datos suficientes
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: 'var(--fesc-border-light)' }}>
                <h3 className="text-lg font-medium mb-6 text-gray-800 border-b pb-2">Actividad Diaria (Últimos 7 días)</h3>
                <div className="h-80 w-full">
                  {barData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{fontSize: 12}} />
                        <YAxis allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="count" name="Operaciones" fill="var(--fesc-primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No hay actividad reciente
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* States History Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-12" style={{ borderColor: 'var(--fesc-border-light)' }}>
              <div className="p-6 border-b" style={{ borderColor: 'var(--fesc-border-light)' }}>
                <h3 className="text-lg font-medium text-gray-800">Historial de Cambios de Estado</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                    <tr>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Tipo</th>
                      <th className="px-6 py-4">Documento</th>
                      <th className="px-6 py-4">Nuevo Estado</th>
                      <th className="px-6 py-4">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingStates ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          Cargando historial...
                        </td>
                      </tr>
                    ) : statesHistory.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No se encontraron registros
                        </td>
                      </tr>
                    ) : (
                      statesHistory.map((state, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                            {state.date}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {state.userName}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${state.targetType === 'Informe' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                              {state.targetType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={state.targetName}>
                            {state.targetName}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-700">{state.state || state.requestState}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={state.description}>
                            {state.description}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Operations Table Section */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--fesc-border-light)' }}>
              <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--fesc-border-light)' }}>
                <h3 className="text-lg font-medium text-gray-800">Registro de Operaciones (CRUD)</h3>
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Filtrar por tipo (ej: INSERT)" 
                    className="px-3 py-2 border rounded-lg text-sm outline-none focus:border-[var(--fesc-primary)]"
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value)
                      setFilterDate('') // Clear date if type is used
                    }}
                  />
                  <input 
                    type="date" 
                    className="px-3 py-2 border rounded-lg text-sm outline-none focus:border-[var(--fesc-primary)]"
                    value={filterDate}
                    onChange={(e) => {
                      setFilterDate(e.target.value)
                      setFilterType('') // Clear type if date is used
                    }}
                  />
                  <button 
                    onClick={handleFilter}
                    className="px-4 py-2 bg-[var(--fesc-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Filtrar
                  </button>
                  {(filterType || filterDate) && (
                    <button 
                      onClick={clearFilters}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                    <tr>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Operación</th>
                      <th className="px-6 py-4">Objeto Afectado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingTable ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          Cargando operaciones...
                        </td>
                      </tr>
                    ) : operations.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          No se encontraron registros
                        </td>
                      </tr>
                    ) : (
                      operations.map((op, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                            {op.date}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {op.username}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${op.operation === 'INSERT' ? 'bg-green-100 text-green-800' : 
                                op.operation === 'UPDATE' ? 'bg-blue-100 text-blue-800' : 
                                op.operation === 'DELETE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                              {op.operation}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {op.objectName}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
