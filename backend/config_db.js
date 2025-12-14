const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'miproyecto2',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a MariaDB:', err);
    return;
  }
  console.log('Conectado a MariaDB miproyecto2');
});

module.exports = db;
