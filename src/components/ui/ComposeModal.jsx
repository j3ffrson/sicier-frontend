import { useState } from 'react'

// Icons
const CloseIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
)

const MinimizeIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M6 19h12v2H6z" />
    </svg>
)

const ExpandIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z" />
    </svg>
)

const AttachIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
    </svg>
)

const DeleteIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
)

export default function ComposeModal({ 
    isOpen, 
    onClose, 
    onSend, 
    onMinimize, 
    isSending = false,
    placeholders = {
        title: 'Nueva Petición',
        to: 'area:ID o user:ID',
        subject: 'Asunto de la petición',
        body: 'Escriba su petición aquí...',
    }
}) {
    const [to, setTo] = useState('')
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [isMinimized, setIsMinimized] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    if (!isOpen) return null

    const handleSend = async () => {
        if (isSending) return
        if (!to || !subject || !body) {
            alert('Por favor complete todos los campos')
            return
        }

        // We don't use a try-catch block here because the parent component
        // is responsible for handling errors and setting `isSending`.
        await onSend?.({ to, subject, body })
    }

    const handleMinimize = () => {
        setIsMinimized(!isMinimized)
        onMinimize?.(!isMinimized)
    }

    const handleExpand = () => {
        setIsExpanded(!isExpanded)
    }

    const handleDiscard = () => {
        if (to || subject || body) {
            if (confirm('¿Desea descartar este borrador?')) {
                setTo('')
                setSubject('')
                setBody('')
                onClose?.()
            }
        } else {
            onClose?.()
        }
    }

    return (
        <div
            className="compose-modal"
            style={{
                width: isExpanded ? '80vw' : '500px',
                maxWidth: isExpanded ? '900px' : '500px',
                height: isMinimized ? 'auto' : isExpanded ? '80vh' : 'auto',
                bottom: isExpanded ? '50%' : '0',
                right: isExpanded ? '50%' : '24px',
                transform: isExpanded ? 'translate(50%, 50%)' : 'none',
                borderRadius: isExpanded ? 'var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) 0 0',
            }}
        >
            {/* Header */}
            <div className="header" onClick={isMinimized ? handleMinimize : undefined} style={{ cursor: isMinimized ? 'pointer' : 'default' }}>
                <span>{placeholders.title}</span>
                <div className="header-actions">
                    <button onClick={handleMinimize} title={isMinimized ? 'Restaurar' : 'Minimizar'}>
                        <MinimizeIcon />
                    </button>
                    <button onClick={handleExpand} title={isExpanded ? 'Reducir' : 'Pantalla completa'}>
                        <ExpandIcon />
                    </button>
                    <button onClick={handleDiscard} title="Cerrar">
                        <CloseIcon />
                    </button>
                </div>
            </div>

            {/* Body - hidden when minimized */}
            {!isMinimized && (
                <>
                    <div className="body">
                        <div className="field">
                            <label>Para:</label>
                            <input
                                type="text"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                placeholder={placeholders.to}
                                disabled={isSending}
                            />
                        </div>
                        <div className="field">
                            <label>Asunto:</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder={placeholders.subject}
                                disabled={isSending}
                            />
                        </div>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder={placeholders.body}
                            style={{ minHeight: isExpanded ? 'calc(80vh - 200px)' : '200px' }}
                            disabled={isSending}
                        />
                    </div>

                    {/* Footer */}
                    <div className="footer">
                        <button className="send-btn" onClick={handleSend} disabled={isSending}>
                            {isSending ? 'Enviando...' : 'Enviar'}
                        </button>
                        <button className="action-btn" title="Adjuntar archivo">
                            <AttachIcon />
                        </button>
                        <div className="flex-1" />
                        <button className="action-btn" onClick={handleDiscard} title="Descartar">
                            <DeleteIcon />
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
