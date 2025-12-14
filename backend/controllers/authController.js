const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/db');
const { sendForgotPasswordEmail } = require('../services/nodemailer');
const { JWT_CONFIG } = require('../config/config'); 

// Helper para manejar respuestas de error consistentes
const sendError = (res, status, message) => {
    if (status === 401) {
        return res.status(401).send(); 
    }
    if (status === 400) {
        return res.status(400).json({ message: message || 'Petición incorrecta.' });
    }
    return res.status(status).json({ message: message || 'Error interno del servidor.' });
};

// ------------------------------------
// Función: postLogin
// ------------------------------------
exports.postLogin = async (req, res) => {
    const { email, clave } = req.body;

    if (!email || !clave) {
        return sendError(res, 400, 'Faltan datos obligatorios (email o clave).');
    }

    try {
        // 1. Buscar usuario por email
        // ⬇️ CORRECCIÓN CLAVE: Quitamos la desestructuración [rows] ⬇️
        const rows = await executeQuery( 
            "SELECT id, nombre_completo, clave, rol FROM usuarios WHERE email = ?",
            [email]
        );

        const usuario = rows[0];

        if (!usuario) {
            return sendError(res, 401); // Usuario no encontrado
        }
        
        // 2. Verificar la contraseña
        const claveValida = await bcrypt.compare(clave, usuario.clave);

        if (!claveValida) {
            return sendError(res, 401); // Contraseña incorrecta
        }

        // 3. Crear JWT con los datos del usuario
        const payload = {
            uid: usuario.id, 
            nombre: usuario.nombre_completo,
            rol: usuario.rol,
        };

        const token = jwt.sign(payload, JWT_CONFIG.SECRET_KEY, {
            algorithm: JWT_CONFIG.ALGORITHM,
            expiresIn: JWT_CONFIG.EXPIRATION_SECONDS
        });

        // 4. Retornar el token
        res.status(200).json({ jwt: token });

    } catch (error) {
        console.error('Error en postLogin:', error);
        sendError(res, error.status || 500, error.message);
    }
};

// ------------------------------------
// Función: getPerfil
// ------------------------------------
exports.getPerfil = async (req, res) => { // ⬅️ DEBE ser 'async'
    // 1. Obtener el ID del usuario desde el JWT decodificado
    // Usamos 'uid' (del token) o 'id' (por seguridad)
    const userId = req.user.uid || req.user.id; 

    if (!userId) {
        return res.status(401).json({ message: 'ID de usuario no encontrado en el token.' });
    }

    try {
        // 2. Consulta a la base de datos para obtener TODOS los campos
        const sql = `
            SELECT 
                id, 
                user_nameweb, 
                email, 
                nombre_completo, 
                avatar, 
                bio, 
                rol, 
                fecha_nacimiento, 
                fecha_registro 
            FROM usuarios 
            WHERE id = ?
        `; 
        
        const rows = await executeQuery(sql, [userId]); // ⬅️ Usamos executeQuery
        const usuario = rows[0];

        if (!usuario) {
            return res.status(404).json({ message: 'Perfil de usuario no encontrado en la base de datos.' });
        }
        
        // 3. Devolver todos los datos del usuario (en snake_case, como están en la DB)
        res.status(200).json(usuario);
        
    } catch (error) {
        console.error('Error al obtener el perfil de la DB:', error);
        // Si hay un error SQL, devolvemos un 500
        res.status(500).json({ message: 'Error interno del servidor al consultar el perfil.' });
    }
};


// ------------------------------------
// Función: patchLogin (Renovar Token)
// ------------------------------------
exports.patchLogin = (req, res) => {
    const payload = req.user;
    
    const newToken = jwt.sign(payload, JWT_CONFIG.SECRET_KEY, {
        algorithm: JWT_CONFIG.ALGORITHM,
        expiresIn: JWT_CONFIG.EXPIRATION_SECONDS
    });
    
    res.status(200).json({ jwt: newToken });
};



// ------------------------------------
// Función: POST (FORGOT PASSWORD)
// ------------------------------------

exports.forgotPassword = async (req, res) => {

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requerido' });

    //  Buscar usuario por email
    const users = await executeQuery(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

   // NO EXISTE
    if (users.length === 0) {
      return res.status(404).json({
        message: 'Email no registrado en la Base de Datos'
      });
    }

    // EXISTE
    const userId = users[0].id;

    const rawToken = crypto.randomBytes(48).toString('hex'); // 96 chars
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const now = Date.now();
    const expiresAt = now + 60 * 60 * 1000; // 1 hora

    await executeQuery(
      `UPDATE token_forgot SET used = 1 WHERE user_id = ? AND used = 0`,
      [userId]
    );

    await executeQuery(
      `INSERT INTO token_forgot (user_id, token_hash, expires_at, used, created_at)
       VALUES (?, ?, ?, 0, ?)`,
      [userId, tokenHash, expiresAt, now]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/password-reset?token=${rawToken}`;
    await sendForgotPasswordEmail(email, resetUrl);

    return res.json({ message: 'Enlace de recuperacion enviado' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ message: 'Error enviando el correo' });
  }
};

// POST /api/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token y nueva contraseña requeridos' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = Date.now();

    const rows = await executeQuery(
      `SELECT id, user_id, expires_at, used
       FROM token_forgot
       WHERE token_hash = ?`,
      [tokenHash]
    );

    if (rows.length === 0) return res.status(400).json({ message: 'Token inválido' });

    const t = rows[0];
    if (t.used === 1) return res.status(400).json({ message: 'Token ya usado' });
    if (now > t.expires_at) return res.status(400).json({ message: 'Token expirado' });

    const hash = await bcrypt.hash(newPassword, 10);

    await executeQuery(`UPDATE usuarios SET clave = ? WHERE id = ?`, [hash, t.user_id]);
    await executeQuery(`UPDATE token_forgot SET used = 1 WHERE id = ?`, [t.id]);

    return res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ message: 'Error reseteando contraseña' });
  }
};