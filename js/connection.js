const mysql = require('mysql2');
const dotenv = require('dotenv');
const { promptUser } = require('./userPrompt'); 


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

const afterConnection = () => {
  console.log('***********************************');
  console.log('*                                 *');
  console.log('*        EMPLOYEE MANAGER         *');
  console.log('*                                 *');
  console.log('***********************************');
  promptUser(); // Make sure promptUser is imported from userPrompt.js
};

module.exports = { storageData, afterConnection, promptUser };
