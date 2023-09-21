const inquirer = require("inquirer");

const { showDepartments, 
        showRoles, 
        showEmployees, 
        addDepartment, 
        addRole, 
        addEmployee, 
        updateEmployee, 
        employeeDepartment, 
        deleteRecord, 
        viewBudget } = require('./routes');



const promptUser = () => {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'choices',
                message: "What would you like to do?",
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Add an manager',
                    'Update an employee role',
                    'Update an employee manager',
                    'View employees by department',
                    'Delete a department',
                    'Delete a role',
                    'Delete an employee',
                    'View department budgets',
                    'No Action'
                ]
            }
        ])
        .then(handleUserChoice);
    };

    const handleUserChoice = (answers) => {
        const { choices } = answers;
    
        switch (choices) {
            case 'View all departments':
            showDepartments();
            break;
            case 'View all roles':
            showRoles();
            break;
            case 'View all employees':
            showEmployees();
            break;
            case 'Add a department':
            addDepartment();
            break;
            case 'Add a role':
            addRole();
            break;
            case 'Add an employee':
            addEmployee();
            break;
            case 'Update an employee role':
            updateEmployee('role');
            break;
            case 'Update an employee manager':
            updateEmployee('manager');
            break;
            case 'View employees by department':
            employeeDepartment();
            break;
            case 'Delete a department':
            deleteRecord('department');
            break;
            case 'Delete a role':
            deleteRecord('role');
            break;
            case 'Delete an employee':
            deleteRecord('employee');
            break;
            case 'View department budgets':
            viewBudget();
            break;
            case 'No Action':
            storageData.end();
            break;      
            default:
            console.log('Invalid choice');
            break;
        }
    };


    module.exports = promptUser;
