require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const commandController = require('./controllers/commandController');
const postsRoutes = require("./routes/postsRoutes");
const { executeQuery } = require('./config/db');
const usuariosRoutes = require('./routes/usuariosRoutes'); 
const comentarioRoutes = require('./routes/comentarios.routes');


const app = express();

// CONFIGURACIÓN DE CORS
const corsOptions = {
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------
// RUTAS
// --------------------------------------

// 1️⃣ Rutas de autenticación (login/perfil)
app.use('/api', authRoutes);

// 2️⃣ Rutas de POSTS (CRUD)
app.use('/api/posts', postsRoutes);

// 3️⃣ Rutas de USUARIOS
app.use('/api/usuarios', usuariosRoutes); 


// 4️⃣ Categorías y otros comandos vía ?comando=
app.get('/api', commandController.handleCommand);
app.post('/api', commandController.handleCommand);

// Comentarios
app.use('/api/comentarios', comentarioRoutes);

// 5️⃣ ENDPOINT REAL DE CATEGORÍAS
app.get('/api/categorias', async (req, res) => {
    try {
        const sql = `SELECT id_categoria, nombre_categoria FROM categorias ORDER BY nombre_categoria ASC`;
        const rows = await executeQuery(sql);
        res.json({ categorias: rows });
    } catch (error) {
        console.error("Error en getCategorias:", error);
        res.status(500).json({ mensaje: "Error al obtener categorías." });
    }
});


// --------------------------------------
// MANEJO DE ERRORES
// --------------------------------------
app.use((err, req, res, next) => {
    const status = err.status || 500;

    if (status === 401 || status === 403) {
        return res.status(status).json({ mensaje: 'Acceso denegado o no autorizado.' });
    }

    console.error('Error no capturado:', err.stack);
    res.status(status).json({ message: err.message || 'Error interno del servidor.' });
});

module.exports = app;
