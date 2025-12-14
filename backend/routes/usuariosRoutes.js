// backend/routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');
const userController = require('../controllers/userController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

// ---------------------------------------------------
// GET - TOTAL DE USUARIOS (PÚBLICO)
// /api/usuarios/count
// ---------------------------------------------------
router.get('/count', async (req, res) => {
    try {
        const sql = `SELECT COUNT(*) AS total FROM usuarios`;
        const rows = await executeQuery(sql);
        const total = rows[0]?.total || 0;
        res.json({ total });
    } catch (error) {
        console.error('Error obteniendo total de usuarios:', error);
        res.status(500).json({ total: 0 });
    }
});

// ---------------------------------------------------
// GET - LISTA DE USUARIOS (SOLO ADMIN)
// /api/usuarios
// ---------------------------------------------------
router.get('/', protectRoute, adminOnly, async (req, res) => {
    try {
        const sql = `
            SELECT 
              id,
              user_nameweb,
              nombre_completo,
              email,
              rol,
              fecha_registro
            FROM usuarios
            ORDER BY fecha_registro ASC
        `;
        const rows = await executeQuery(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ message: 'Error obteniendo usuarios.' });
    }
});

// ---------------------------------------------------
// DELETE - ELIMINAR USUARIO (SOLO ADMIN GENERAL)
// ---------------------------------------------------
router.delete('/:id', protectRoute, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const actorId = req.user.uid;

        // ❌ No se puede eliminar al administrador general (id=1)
        if (Number(id) === 1) {
            return res.status(403).json({
                message: 'No se puede eliminar al administrador general.'
            });
        }
        
        // ❌ El usuario no puede eliminarse a sí mismo
        if (Number(id) === actorId) {
             return res.status(403).json({
                message: 'No puedes eliminar tu propia cuenta.'
            });
        }

        // ❌ Solo el administrador general puede eliminar a otros
        if (actorId !== 1) {
            return res.status(403).json({
                message: 'Solo el administrador general puede eliminar usuarios.'
            });
        }

        const sql = `DELETE FROM usuarios WHERE id = ?`;
        await executeQuery(sql, [id]);

        res.json({ message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error eliminando usuario.' });
    }
});


// ---------------------------------------------------
// PUT - MODIFICAR ROL DE USUARIO (SOLO ADMIN)
// /api/usuarios/:id/rol
// ---------------------------------------------------
router.put('/:id/rol', protectRoute, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;

        const actorId = req.user.uid;

        // ❌ Proteger administrador general (ID=1)
        if (Number(id) === 1) {
            return res.status(403).json({
                message: 'No se puede modificar el rol del administrador general.'
            });
        }

        // Validar rol permitido
        if (!rol || !['admin', 'normaluser'].includes(rol)) {
            return res.status(400).json({ message: 'Rol inválido.' });
        }

        // Obtener rol actual del usuario objetivo
        const rows = await executeQuery(
            'SELECT rol FROM usuarios WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const rolActual = rows[0].rol;

        // ❌ Nadie puede bajarse su propio rol
        if (Number(id) === actorId && rol === 'normaluser') {
            return res.status(400).json({
                message: 'No puedes quitarte tu propio rol de admin.'
            });
        }

        // ❌ Solo el administrador principal (ID=1) puede bajar a otros admins
        if (
            rolActual === 'admin' &&
            rol === 'normaluser' &&
            actorId !== 1
        ) {
            return res.status(403).json({
                message: 'Solo el administrador principal puede quitar el rol de admin.'
            });
        }

        // ✅ Actualizar rol
        await executeQuery(
            'UPDATE usuarios SET rol = ? WHERE id = ?',
            [rol, id]
        );

        res.json({ message: 'Rol actualizado correctamente.' });

    } catch (error) {
        console.error('Error actualizando rol:', error);
        res.status(500).json({ message: 'Error actualizando rol.' });
    }
});


// ---------------------------------------------------
// POST - REGISTRO (SIN CAMBIOS)
// ---------------------------------------------------
router.post('/', userController.createUser);

module.exports = router;