import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './app/routes'
import { WebSocketProvider } from './context/WebSocketContext'

export default function App() {
  return (
    <BrowserRouter>
      <WebSocketProvider>
        <AppRoutes />
      </WebSocketProvider>
    </BrowserRouter>
  )
}
