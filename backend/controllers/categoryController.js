// backend/controllers/categoryController.js (Nuevo y Completo)

const { executeQuery } = require('../config/db'); 

exports.getCategorias = async (req, res) => {
    try {
        const rows = await executeQuery('SELECT * FROM categorias ORDER BY nombre_categoria ASC');
        return res.json({ categorias: rows }); 
    } catch (error) {
        console.error("Error en getCategorias (SQLite):", error);
        return res.status(500).json({ mensaje: "Error al obtener categorías." });
    }
};

exports.crearCategoria = async (req, res) => {
    try {
        const { nombre_categoria } = req.body;
        if (!nombre_categoria) {
            return res.status(400).json({ mensaje: "El nombre de la categoría es requerido." });
        }
        
        const result = await executeQuery('INSERT INTO categorias (nombre_categoria) VALUES (?)', [nombre_categoria]);
        
        return res.status(201).json({ 
            mensaje: 'Categoría creada exitosamente.',
            id_categoria: result.lastID 
        });
    } catch (error) {
        if (error.errno === 19) {
             return res.status(409).json({ mensaje: "El nombre de la categoría ya existe." });
        }
        return res.status(500).json({ mensaje: "Error al crear categoría." });
    }
};

exports.eliminarCategoria = async (req, res) => {
    try {
        const { id_categoria } = req.body; 
        
        const result = await executeQuery('DELETE FROM categorias WHERE id_categoria = ?', [id_categoria]);

        if (result.changes === 0) {
            return res.status(404).json({ mensaje: 'Categoría no encontrada.' });
        }
        
        return res.json({ mensaje: 'Categoría eliminada exitosamente.' });
    } catch (error) {
        return res.status(500).json({ mensaje: "Error al eliminar categoría." });
    }
};