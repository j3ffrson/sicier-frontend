// Configuracion de la URL base del API
// Para producción, esta variable debe definirse en el entorno (ej: .env.production)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/sicier/api/v1'

export default API_BASE_URL
