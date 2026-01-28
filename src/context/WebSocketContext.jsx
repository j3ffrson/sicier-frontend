import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getUsername, getAreaId, isLoggedIn } from '../store/authStore'

const WebSocketContext = createContext(null)

export const useWebSocket = () => useContext(WebSocketContext)

export const WebSocketProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const clientRef = useRef(null)
  const username = getUsername()
  const areaId = getAreaId()
  const loggedIn = isLoggedIn()

  useEffect(() => {
    if (!loggedIn || !username) return

    // Configurar cliente STOMP
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'), // Ajusta la URL si es necesario
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Conectado a WebSockets como:', username)

        // Suscribirse al tópico de usuario por username
        client.subscribe(`/topic/queue/${username}`, (message) => {
          handleMessage(JSON.parse(message.body))
        })

        // Suscribirse al tópico de área (si existe)
        if (areaId) {
          client.subscribe(`/topic/area/${areaId}`, (message) => {
            handleMessage(JSON.parse(message.body))
          })
        }
      },
      onStompError: (frame) => {
        console.error('Error en STOMP:', frame.headers['message'])
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate()
      }
    }
  }, [loggedIn, username, areaId])

  const handleMessage = (notification) => {
    console.log('Notificación recibida:', notification)
    // Añadir notificación a la lista con un ID único temporal
    const newNotif = { ...notification, _id: Date.now() }
    setNotifications((prev) => [...prev, newNotif])

    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n._id !== newNotif._id))
    }, 10000)
  }

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id))
  }

  return (
    <WebSocketContext.Provider value={{ notifications }}>
      {children}
      {/* Renderizar Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((notif) => (
          <div
            key={notif._id}
            className="bg-white border border-l-4 border-l-[var(--fesc-primary)] shadow-lg rounded p-4 min-w-[300px] animate-slide-in"
            style={{ borderColor: 'var(--fesc-primary)' }}
          >
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-sm text-gray-800">{notif.title || 'Nueva Notificación'}</h4>
              <button
                onClick={() => removeNotification(notif._id)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">{notif.message || notif.description || 'Tienes un nuevo mensaje.'}</p>
          </div>
        ))}
      </div>
    </WebSocketContext.Provider>
  )
}
