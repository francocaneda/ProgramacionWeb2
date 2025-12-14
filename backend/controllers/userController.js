// backend/controllers/userController.js
const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/db');

exports.createUser = async (req, res) => {
  try {
    const { user_nameweb, email, clave, nombre_completo, fecha_nacimiento, bio } = req.body;

    if (!user_nameweb || !email || !clave || !nombre_completo) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    const existe = await executeQuery(
      "SELECT id FROM usuarios WHERE user_nameweb = ? OR email = ?",
      [user_nameweb, email]
    );
    if (existe.length > 0) {
      return res.status(409).json({ message: 'Usuario o email ya registrado.' });
    }

    const hash = await bcrypt.hash(clave, 10);

    const result = await executeQuery(
      `INSERT INTO usuarios
       (user_nameweb, email, clave, nombre_completo, avatar, bio, fecha_nacimiento, rol, fecha_registro)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        user_nameweb,
        email,
        hash,
        nombre_completo,
        null,
        bio || '',
        fecha_nacimiento || null,
        'normaluser'
      ]
    );

    return res.status(201).json({ message: 'Usuario registrado', id: result.lastID });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al registrar usuario' });
  }
};