

// backend/config/db.js
// Advanced MySQL connection pool using mysql2/promise
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection immediately.
pool.getConnection()
  .then(conn => {
    console.log('Connected to MySQL database successfully.');
    conn.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL database:', err);
  });

module.exports = pool;
