// backend/config/config.js (Código Completo)

// ------------------------------------
// 1. Configuración de Base de Datos
// Tomado de config_db.php
// ------------------------------------
const DB_CONFIG = {
    host: 'localhost',
    user: 'miproyecto',
    password: 'qdZym[6uq4oo@bS.', // ¡IMPORTANTE! Es la contraseña original de tu DB
    database: 'miproyecto',
    // Usamos el pool de conexiones para mejor rendimiento en Express
    waitForConnections: true, 
    connectionLimit: 10,
    queueLimit: 0
};

// ------------------------------------
// 2. Configuración de JWT
// Tomado de config_jwt.php
// ------------------------------------
const JWT_CONFIG = {
    // Clave secreta: debe ser idéntica a la que usaste en PHP
    SECRET_KEY: 'AS..-.DJKLds·ak$dl%Ll!3kj12l3k1sa4_ÑÑ312ñ12LK3Jj4DK5A6LS7JDLK¿?asDqiwUEASDL,NMQWIEUIO', 
    // Algoritmo: debe ser el mismo que usaste en PHP
    ALGORITHM: 'HS512', 
    // Expiración: 600 segundos (10 minutos), tomado de JWT_EXP
    EXPIRATION_SECONDS: 600
};

// En un entorno de producción real, estos valores deberían cargarse desde variables de entorno.
module.exports = {
    DB_CONFIG,
    JWT_CONFIG
};