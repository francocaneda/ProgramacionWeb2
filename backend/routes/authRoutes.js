const { Router } = require('express');
const router = Router();
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const { executeQuery } = require('../config/db');

router.post('/login', authController.postLogin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/perfil', authMiddleware.protectRoute, authController.getPerfil);
router.patch('/login', authMiddleware.protectRoute, authController.patchLogin);
router.patch('/perfil', authMiddleware.protectRoute, authController.patchPerfil);


// Obtener datos del usuario logueado (nombre, email, rol)
router.get('/me', authMiddleware.protectRoute, async (req, res) => {
    try {
        const uid = req.userId;
        const sql = `SELECT id, nombre_completo, email, rol FROM usuarios WHERE id = ?`;
        const rows = await executeQuery(sql, [uid]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Error en /me:", error);
        res.status(500).json({ mensaje: 'Error al obtener datos del usuario' });
    }
});

module.exports = router;
