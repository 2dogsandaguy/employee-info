const mysql = require('mysql2');
const inquirer = require('inquirer');
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

const promptUser = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'choices',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
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

const showDepartments = () => {
  console.log('Showing departments...'); 
  const sql = `SELECT department.id AS id, department.name AS department FROM department`;
  queryAndDisplay(sql);
};


const showRoles = () => {
  queryAndDisplay(`SELECT role.id, role.title, department.name AS department
                  FROM role
                  INNER JOIN department ON role.department_id = department.id`);
};

const showEmployees = () => {
  queryAndDisplay(`SELECT employee.id, employee.first_name, employee.last_name, role.title, 
                  department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager
                  FROM employee
                  LEFT JOIN role ON employee.role_id = role.id
                  LEFT JOIN department ON role.department_id = department.id
                  LEFT JOIN employee manager ON employee.manager_id = manager.id`);
};

const queryAndDisplay = (sql) => {
  storageData.promise()
    .query(sql)
    .then(([rows, fields]) => {
      console.table(rows);
      promptUser();
    })
    .catch((err) => {
      console.error(err);
      promptUser();
    });
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'addDept',
        message: 'What department do you want to add?',
        validate: (addDept) => (addDept ? true : 'Please enter a department')
      }
    ])
    .then((answer) => {
      const sql = 'INSERT INTO department (name) VALUES (?)';
      storageData.query(sql, answer.addDept, (err) => {
        if (err) throw err;
        console.log(`Added ${answer.addDept} to departments!`);
        showDepartments();
      });
    });
};

const addRole = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'role',
        message: 'What role do you want to add?',
        validate: (addRole) => (addRole ? true : 'Please enter a role')
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary of this role?',
        validate: (addSalary) => (isNaN(addSalary) ? 'Please enter a valid salary' : true )
      }
    ])
    .then((answer) => {
      const { role, salary } = answer;
      const params = [role, salary];

      const roleSql = 'SELECT name, id FROM department';
      storageData.promise()
        .query(roleSql)
        .then(([rows]) => {
          const dept = rows.map(({ name, id }) => ({ name: name, value: id }));

          inquirer.prompt([
            {
              type: 'list',
              name: 'dept',
              message: 'What department is this role in?',
              choices: dept
            }
          ]).then((deptChoice) => {
            const dept = deptChoice.dept;
            params.push(dept);

            const sql = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
            storageData.promise()
              .query(sql, params)
              .then(() => {
                console.log(`Added ${role} to roles!`);
                showRoles();
              })
              .catch((err) => {
                console.error(err);
                promptUser();
              });
          });
        })
        .catch((err) => {
          console.error(err);
          promptUser();
        });
    });
};


const addEmployee = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "What is the employee's first name?",
        validate: (addFirst) => (addFirst ? true : 'Please enter a first name')
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
        validate: (addLast) => (addLast ? true : 'Please enter a last name')
      }
    ])
    .then((answer) => {
      const { firstName, lastName } = answer;
      const params = [firstName, lastName];

      const roleSql = 'SELECT role.id, role.title FROM role';
      storageData.promise()
        .query(roleSql)
        .then(([rows]) => {
          const roles = rows.map(({ id, title }) => ({ name: title, value: id }));

          inquirer.prompt([
            {
              type: 'list',
              name: 'role',
              message: "What is the employee's role?",
              choices: roles
            }
          ]).then((roleChoice) => {
            const role = roleChoice.role;
            params.push(role);

            const managerSql = 'SELECT * FROM employee';
            storageData.promise()
              .query(managerSql)
              .then(([rows]) => {
                const managers = rows.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));

                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager?",
                    choices: managers
                  }
                ]).then((managerChoice) => {
                  const manager = managerChoice.manager;
                  params.push(manager);

                  const sql = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
                  storageData.promise()
                    .query(sql, params)
                    .then(() => {
                      console.log('Employee has been added!');
                      showEmployees();
                    })
                    .catch((err) => {
                      console.error(err);
                      promptUser();
                    });
                });
              })
              .catch((err) => {
                console.error(err);
                promptUser();
              });
          });
        })
        .catch((err) => {
          console.error(err);
          promptUser();
        });
    });

};



const updateEmployee = (updateType) => {
  const employeeSql = 'SELECT * FROM employee';
  storageData.promise().query(employeeSql)
    .then(([data]) => {
      const employees = data.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));

      inquirer.prompt([
        {
          type: 'list',
          name: 'name',
          message: "Which employee would you like to update?",
          choices: employees
        }
      ]).then((empChoice) => {
        const employee = empChoice.name;
        const params = [];
        params.push(employee);

        const roleSql = 'SELECT * FROM role';
          storageData.promise().query(roleSql)
          .then(([data]) => {
            const roles = data.map(({ id, title }) => ({ name: title, value: id }));

            inquirer.prompt([
              {
                type: 'list',
                name: 'role',
                message: `What is the employee's new ${updateType}?`,
                choices: updateType === 'role' ? roles : employees
              }
            ]).then((roleChoice) => {
              const role = roleChoice.role;
              params.push(role);

              let targetField = 'role_id';
              if (updateType === 'manager') {
                targetField = 'manager_id';
              }

              params[0] = role;
              params[1] = params[0];

              const sql = `UPDATE employee SET ${targetField} = ? WHERE id = ?`;
                storageData.promise().query(sql, params)
                .then(() => {
                  console.log(`Employee ${updateType} has been updated!`);
                  showEmployees();
                })
                .catch((err) => {
                  console.error(err);
                  promptUser();
                });
            });
          })
          .catch((err) => {
            console.error(err);
            promptUser();
          });
      });
    })
    .catch((err) => {
      console.error(err);
      promptUser();
    });
};


const employeeDepartment = () => {
  queryAndDisplay(`SELECT employee.first_name, employee.last_name, department.name AS department
                  FROM employee
                  LEFT JOIN role ON employee.role_id = role.id
                  LEFT JOIN department ON role.department_id = department.id`);
};

const deleteRecord = (recordType) => {
  const sql = `SELECT * FROM ${recordType}`;
  storageData.promise().query(sql, (err, data) => {
    if (err) throw err;

    const records = data.map(({ id, name }) => ({ name, value: id }));

    inquirer.prompt([
      {
        type: 'list',
        name: 'record',
        message: `Which ${recordType} do you want to delete?`,
        choices: records
      }
    ]).then((recordChoice) => {
      const record = recordChoice.record;
      const deleteSql = `DELETE FROM ${recordType} WHERE id = ?`;

      storageData.query(deleteSql, record, (err) => {
        if (err) throw err;
        console.log(`Successfully deleted ${recordType}!`);

        switch (recordType) {
          case 'department':
            showDepartments();
            break;
          case 'role':
            showRoles();
            break;
          case 'employee':
            showEmployees();
            break;
          default:
            promptUser();
        }
      });
    });
  });
};

const viewBudget = () => {
  queryAndDisplay(`SELECT department_id AS id, department.name AS department, SUM(salary) AS budget
                  FROM role
                  JOIN department ON role.department_id = department.id GROUP BY department_id`);
};


storageData.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    afterConnection();
  }
});

const afterConnection = () => {
  console.log('***********************************');
  console.log('*                                 *');
  console.log('*        EMPLOYEE MANAGER         *');
  console.log('*                                 *');
  console.log('***********************************');
  promptUser();
};
