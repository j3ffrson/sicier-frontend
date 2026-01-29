import { useContext } from 'react'
import { WebSocketContext } from '../context/SocketContext'

export const useWebSocket = () => useContext(WebSocketContext)
