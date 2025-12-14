// backend/routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');
const userController = require('../controllers/userController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

// ---------------------------------------------------
// GET - TOTAL DE USUARIOS (PÚBLICO / USO GENERAL)
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
// DELETE - ELIMINAR USUARIO (SOLO ADMIN)
// /api/usuarios/:id
// ---------------------------------------------------
router.delete('/:id', protectRoute, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        // Evitar que el admin se borre a sí mismo
        if (Number(id) === req.user.uid) {
            return res.status(400).json({ message: 'No puedes eliminar tu propio usuario.' });
        }

        const sql = `DELETE FROM usuarios WHERE id = ?`;
        await executeQuery(sql, [id]);

        res.json({ message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ message: 'Error eliminando usuario.' });
    }
});

// ---------------------------------------------------
// POST - REGISTRO (SIN CAMBIOS)
// ---------------------------------------------------
router.post('/', userController.createUser);

module.exports = router;
