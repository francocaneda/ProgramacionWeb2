const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/db');
const { JWT_CONFIG } = require('../config/config');

// GET - OBTENER TODOS LOS POSTS
router.get('/', async (req, res) => {
    try {
        const sql = `SELECT * FROM posts ORDER BY fecha_creacion DESC`;
        const rows = await executeQuery(sql);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener posts:", error);
        res.status(500).json({ message: "Error al obtener posts." });
    }
});

// GET - OBTENER POSTS POR CATEGORÍA
router.get('/categoria/:id_categoria', async (req, res) => {
    const { id_categoria } = req.params;

    try {
        const sql = `
            SELECT *
            FROM posts
            WHERE id_categoria = ?
            ORDER BY fecha_creacion DESC
        `;
        const rows = await executeQuery(sql, [id_categoria]);

        // Devuelve arreglo vacío si no hay posts (para evitar 404)
        res.json(rows || []);
    } catch (error) {
        console.error("Error al obtener posts por categoría:", error);
        res.status(500).json({ message: "Error al obtener posts por categoría." });
    }
});

// POST - CREAR NUEVO POST
router.post('/', async (req, res) => {
    const { id_categoria, titulo, contenido } = req.body;

    if (!id_categoria || !titulo || !contenido) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ mensaje: 'No se pudo identificar al usuario.' });

        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ mensaje: 'No se pudo identificar al usuario.' });

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_CONFIG.SECRET_KEY, { algorithms: [JWT_CONFIG.ALGORITHM] });
        } catch (err) {
            return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
        }

        const id_usuario = decoded.uid;
        if (!id_usuario) return res.status(401).json({ mensaje: 'No se pudo identificar al usuario.' });

        const sql = `
            INSERT INTO posts (id_categoria, titulo, contenido, id_usuario, fecha_creacion)
            VALUES (?, ?, ?, ?, datetime('now'))
        `;
        await executeQuery(sql, [id_categoria, titulo, contenido, id_usuario]);

        res.status(201).json({ mensaje: 'Post creado correctamente.' });
    } catch (error) {
        console.error("Error al crear post:", error);
        res.status(500).json({ mensaje: "Error al crear el post." });
    }
});

// GET - DETALLE DE UN POST
router.get('/detalle/:id_post', async (req, res) => {
    const { id_post } = req.params;
    try {
        const sql = `
            SELECT p.*, u.nombre_completo, u.rol AS rol_usuario
            FROM posts p
            JOIN usuarios u ON p.id_usuario = u.id
            WHERE p.id_post = ?
        `;
        const rows = await executeQuery(sql, [id_post]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ mensaje: "Post no encontrado." });
        }

        res.json({ post: rows[0] });
    } catch (error) {
        console.error("Error al obtener detalle del post:", error);
        res.status(500).json({ mensaje: "Error al obtener el post." });
    }
});

// DELETE - ELIMINAR UN POST
router.delete('/:id_post', async (req, res) => {
    const { id_post } = req.params;
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ mensaje: 'No se pudo identificar al usuario.' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ mensaje: 'No se pudo identificar al usuario.' });

    let decoded;
    try {
        decoded = jwt.verify(token, JWT_CONFIG.SECRET_KEY, { algorithms: [JWT_CONFIG.ALGORITHM] });
    } catch (err) {
        return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
    }

    const uid = decoded.uid;
    const rol = decoded.rol;

    try {
        const sqlPost = `SELECT id_usuario FROM posts WHERE id_post = ?`;
        const rows = await executeQuery(sqlPost, [id_post]);

        if (!rows || rows.length === 0) return res.status(404).json({ mensaje: 'Post no encontrado.' });

        const post = rows[0];
        if (post.id_usuario !== uid && rol !== 'admin') {
            return res.status(403).json({ mensaje: 'No tienes permisos para eliminar este post.' });
        }

        const sqlDelete = `DELETE FROM posts WHERE id_post = ?`;
        await executeQuery(sqlDelete, [id_post]);

        res.json({ mensaje: 'Post eliminado correctamente.' });
    } catch (error) {
        console.error("Error eliminando post:", error);
        res.status(500).json({ mensaje: "Error eliminando el post." });
    }
});

module.exports = router;
