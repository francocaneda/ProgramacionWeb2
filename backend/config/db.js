// backend/config/db.js (CÓDIGO COMPLETO CORREGIDO)

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'foro.sqlite'); 

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error al conectar a SQLite:', err.message);
    } else {
        console.log('✅ Conectado a la base de datos SQLite.');
        
        initializeDatabase();
    }
});

/**
 * Inicializa las tablas de la base de datos con la estructura de tu JSON.
 */
function initializeDatabase() {
    // 1. TABLA USUARIOS (Alineada con tu JSON)
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_nameweb TEXT UNIQUE,         
            email TEXT UNIQUE,
            clave TEXT,
            nombre_completo TEXT,
            avatar TEXT,
            bio TEXT,                           
            fecha_nacimiento TEXT,              
            rol TEXT DEFAULT 'normaluser',
            fecha_registro TEXT
        )`, (err) => {
            if (err) { 
                console.error("Error SQL al crear la tabla USUARIOS:", err);
            }
        });
    
    // 2. TABLA CATEGORÍAS
    db.run(`
        CREATE TABLE IF NOT EXISTS categorias (
            id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_categoria TEXT UNIQUE NOT NULL
        )`, (err) => {
            if (err) {
                 console.error("Error SQL al crear la tabla CATEGORIAS:", err);
            }
        });
}

/**
 * Ejecuta una consulta a la base de datos y devuelve una Promesa.
 * Ahora devuelve el array de filas directamente (NO anidado).
 * @param {string} sql - La consulta SQL a ejecutar.
 * @param {Array} params - Parámetros para la consulta.
 * @returns {Promise<Array | Object>} Una promesa que resuelve a un array de resultados (SELECT) o un objeto con detalles (INSERT/UPDATE/DELETE).
 */
exports.executeQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        // Usamos db.all para SELECT (devuelve todas las filas)
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error("Error en consulta SELECT:", err.message);
                    return reject(err);
                }
                // ⬇️ CORRECCIÓN CLAVE: Devolvemos las filas DIRECTAMENTE ⬇️
                resolve(rows); 
            });
        } 
        // Usamos db.run para INSERT, UPDATE, DELETE
        else {
            db.run(sql, params, function (err) {
                if (err) {
                    console.error("Error en consulta RUN:", err.message);
                    return reject(err);
                }
                resolve({ changes: this.changes, lastID: this.lastID }); 
            });
        }
    });
};

exports.db = db;