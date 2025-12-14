// backend/controllers/commandController.js (Nuevo y Completo)

const categoryController = require('./categoryController');
// AGREGAR: const authController = require('./authController'); si usas comandos para login

exports.handleCommand = async (req, res, next) => {
    const comando = req.query.comando ? req.query.comando.toLowerCase().trim() : null;

    if (!comando) {
        if (req.method === 'GET') {
             return res.status(200).json({ status: 'API OK', mensaje: 'Especifique un comando.' });
        }
        return res.status(400).json({ error: 'Comando API no especificado.' });
    }

    try {
        switch (comando) {
            // Rutas de Categorías
            case 'categorias':
                return categoryController.getCategorias(req, res); 
            case 'crearcategoria':
                return categoryController.crearCategoria(req, res); 
            case 'eliminarcategoria':
                return categoryController.eliminarCategoria(req, res); 
            
            // AGREGAR: Otros comandos aquí
            
            default:
                return res.status(404).json({ error: `Comando '${comando}' no encontrado.` });
        }
    } catch (error) {
        next(error); 
    }
};