// backend/middleware/authMiddleware.js (CORREGIDO)

const jwt = require('jsonwebtoken');
// ⬇️ CORRECCIÓN: Importar la clave secreta desde el archivo de configuración ⬇️
const { JWT_CONFIG } = require('../config/config'); 

// 💡 La clave secreta ahora se toma de JWT_CONFIG.SECRET_KEY
const SECRET_KEY = JWT_CONFIG.SECRET_KEY;
const ALGORITHM = JWT_CONFIG.ALGORITHM;


/**
 * Middleware para verificar la validez del JWT en las peticiones entrantes.
 * Adjunta la información del usuario (payload) a req.user si el token es válido.
 */
function protectRoute(req, res, next) {
    // 1. Obtener el token del encabezado Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            message: 'Acceso denegado. Se requiere autenticación.' 
        });
    }

    // Extraer el token (la parte después de 'Bearer ')
    const token = authHeader.split(' ')[1];

    try {
        // 2. Verificar y decodificar el token, usando la clave y el algoritmo correctos
        const decoded = jwt.verify(token, SECRET_KEY, { 
            algorithms: [ALGORITHM] // Especificar el algoritmo, ya que estás usando HS512
        });
        
        // 3. Adjuntar la información del payload al objeto request
        req.user = decoded; 

        
        // 4. Continuar con la ejecución de la ruta
        next(); 
    } catch (err) {
        // Manejo de errores de JWT (SignatureInvalidException, ExpiredException, etc.)
        let message = 'Token inválido.';
        
        if (err.name === 'TokenExpiredError') {
            message = 'Su sesión ha expirado. Por favor, inicie sesión de nuevo.';
        } else if (err.name === 'JsonWebTokenError') {
            // Este error ocurre cuando la firma es incorrecta (clave secreta errónea)
            message = 'Token no válido. Firma o formato incorrecto.';
        }

        return res.status(403).json({ 
            message: message 
        });
    }
}

// Middleware opcional para verificar el rol de administrador
function adminOnly(req, res, next) {
    // Asume que protectRoute ya se ejecutó y adjuntó req.user
    if (req.user && req.user.rol === 'admin') {
        next(); // Es admin, continuar
    } else {
        return res.status(403).json({ 
            message: 'Acceso denegado. Se requiere rol de administrador.' 
        });
    }
}


module.exports = { 
    protectRoute,
    adminOnly
};