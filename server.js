const inquirer = require('inquirer');
const storageData = require('./js/connection');
const userPrompt = require('./js/userPrompt');

userPrompt()


storageData.connect((err => {
  if (err) {
    console.error('Error connection to the Data Base:', err);
  }else {
    afterConnection();
  }
}));

const afterConnection = () => {
  console.log('***********************************');
  console.log('*                                 *');
  console.log('*        EMPLOYEE MANAGER         *');
  console.log('*                                 *');
  console.log('***********************************');
  promptUser();
};