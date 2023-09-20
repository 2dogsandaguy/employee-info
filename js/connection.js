const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const storageData = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

storageData.connect((err) => {
  if (err) {
    console.error('Error connecting to the Data Base:', err);
    throw err;
  }
  console.log('Connected to the Data Base.');
});

module.exports = storageData;


