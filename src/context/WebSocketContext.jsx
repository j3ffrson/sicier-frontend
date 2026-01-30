import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getUsername, getAreaName, isLoggedIn } from '../store/authStore'
import { WebSocketContext } from './SocketContext'

// Para producción, esta variable debe definirse en el entorno (ej: .env.production)
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'

export const WebSocketProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const clientRef = useRef(null)
  const username = getUsername()
  const areaName = getAreaName()
  const loggedIn = isLoggedIn()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loggedIn || !username) return

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Conectado a WebSockets como:', username)

        client.subscribe(`/queue/user/${username}`, (message) => {
          handleMessage(JSON.parse(message.body))
        })

        if (areaName) {
          console.log('Suscribiendo a área:', areaName)
          client.subscribe(`/topic/area/${areaName}`, (message) => {
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
  }, [loggedIn, username, areaName])

  const handleMessage = (notification) => {
    console.log('Notificación recibida:', notification)
    const newNotif = { ...notification, _id: Date.now() }
    setNotifications((prev) => [...prev, newNotif])

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n._id !== newNotif._id))
    }, 8000)
  }

  const removeNotification = (id, e) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n._id !== id))
  }

  const handleNotificationClick = (notif) => {
    if (notif.idRequest) {
      navigate(`/requests/inbox`)
    }
    setNotifications((prev) => prev.filter((n) => n._id !== notif._id))
  }

  return (
    <WebSocketContext.Provider value={{ notifications }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
        {notifications.map((notif) => (
          <div
            key={notif._id}
            onClick={() => handleNotificationClick(notif)}
            className="bg-white border border-l-4 shadow-lg rounded-lg p-5 w-96 cursor-pointer transition-all hover:shadow-xl animate-slide-in"
            style={{ borderColor: 'var(--fesc-primary)' }}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-base text-gray-800">{notif.title || 'Nueva Notificación'}</h4>
              <button
                onClick={(e) => removeNotification(notif._id, e)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{notif.description || 'Tienes un nuevo mensaje.'}</p>
            <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
              <span>De: {notif.requested || 'Sistema'}</span>
              <span>{notif.date}</span>
            </div>
          </div>
        ))}
      </div>
    </WebSocketContext.Provider>
  )
}
