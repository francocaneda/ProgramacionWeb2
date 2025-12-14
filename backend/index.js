// backend/index.js (Código Completo y Corregido)

const app = require('./app');
// ⬇️ CORRECCIÓN CLAVE: Usar el puerto 8012 ⬇️
const PORT = process.env.PORT || 8012; 

app.listen(PORT, () => {
  console.log(`🚀 El servidor de Express esta corriendo en http://localhost:${PORT}`);
});