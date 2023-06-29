const inquirer = require('inquirer');
const mysql = require('mysql2');

// create the connection information for the sql database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'job_db'
    },
    console.log(`Connected to the employee database.`)
);
db.query (
    'SELECT * FROM employee', 
    function(err, results, fields) {
        console.log(results);
        console.log(fields);
    }
);
// init funtion to start the app on 'node server.js'

const init = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'Menu',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'Add Employee',
                'Update Employee Role',
                'View All Roles',
                'Add Role',
                'View All Departments',
                'Add Department',
                'Exit'
            ],
        },
    ])

    .then((selection) => {
        switch (selection.Menu) {
            case 'View All Employees':
                console.log('beforeViewAllEmployees');
                viewAllEmployees();
                console.log('afterViewAllEmployees');
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'View All Departments':
                viewAllDepartments();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Exit':
                db.end();
                break;
        }
    })
};

// view all employees in the job_db

viewAllEmployees = () => {
    const sql = `SELECT employees.id, employees.first_name, employees.last_name, roles.title, roles.salary, departments.department_name AS department, CONCAT(managers.first_name, ' ', managers.last_name) AS manager
    FROM employees
    LEFT JOIN roles ON employees.roles_id = roles.id
    LEFT JOIN departments ON roles.departments_id = departments.id
    LEFT JOIN employees managers ON employees.manager_id = managers.id`;

    db.query(sql, (err, rows) => {
        console.log(err);
        if (err) throw err;
        console.table(rows);
        init();
    });
};

// add an employee to the job_db

addEmployee = () => {
    let roleChoices = [];
    let rolesData = [];
    db.query('SELECT * FROM role', (err, rows) => {
        if (err) throw err;
        rolesData = rows;
        rolesData.forEach((role) => {
        roleChoices.push(role.title);
        });
    }
    );
    let employeeChoices = [];
    let employeesData = [];
    db.query('SELECT * FROM employee', (err, rows) => {
        if (err) throw err;
        employeesData = rows;
        employeesData.forEach((employee) => {
            employeeChoices.push(employee.first_name + ' ' + employee.last_name);
        });
    }
    );
    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'What is the first name of the employee?',
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'What is the last name of the employee?',
        },
        {
            type: 'list',
            name: 'role',
            message: 'What is the role of the employee?',
            choices: roleChoices
        },
        {
            type: 'list',
            name: 'manager',
            message: 'Who is the manager of the employee?',
            choices: employeeChoices
        }
    ])
    .then((userInput) => {
        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)` + `VALUES (?, ?, ?, ?)`;
        const rolesTitle = userInput.role;
        const managerName = userInput.manager;
        let roleID;
        let managerID;
        rolesData.forEach((role) => {
            if (role.title === rolesTitle) {
                roleID = role.id;
            }
        }
        );
        employeesData.forEach((employee) => {
            if (employee.first_name + ' ' + employee.last_name === managerName) {
                managerID = employee.id;
            }
        }
        );
        const params = [userInput.first_name, userInput.last_name, roleID, managerID];
        db.query(sql, params, (err, result) => {
            if (err) throw err;
            console.log('Employee added successfully!');
            init();
        }
        );
    });
};

// update an employee's role in the job_db

updateEmployeeRole = () => {
    let employeeChoices = [];
    let employeesData = [];
    db.promise().query('SELECT * FROM employee')
    .then(([rows,]) => {
        employeesData = rows;
        rows.map((row) => {
        employeeChoices.push(row.first_name + ' ' + row.last_name);
        });
    })
    .then(() => {
        let roleChoices = [];
        let rolesData = [];
        db.promise().query('SELECT * FROM role')
        .then(([rows,]) => {
            rolesData = rows;
            rows.map((row) => {
            roleChoices.push(row.title);
            });
        })
        .then(() => {
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: 'Which employee would you like to update?',
                    choices: employeeChoices
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is the employee\'s new role?',
                    choices: roleChoices
                }
            ])
            .then((userInput) => {
                const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
                const rolesTitle = userInput.role;
                const employeeName = userInput.employee;
                let roleID;
                let employeeID;
                rolesData.forEach((role) => {
                    if (role.title === rolesTitle) {
                        roleID = role.id;
                    }
                }
                );
                employeesData.forEach((employee) => {
                    if (employee.first_name + ' ' + employee.last_name === employeeName) {
                        employeeID = employee.id;
                    }
                }
                );
                const params = [roleID, employeeID];
                db.promise().query(sql, params)
                .then(() => {
                    console.log('Employee role updated successfully!');
                    init();
                });
            });
        });
    });
};

// view all roles in the job_db

viewAllRoles = () => {
    const sql = `SELECT role.id, role.title, department.name AS department, role.salary
    FROM role
    LEFT JOIN department ON role.department_id = department.id;`;

    db.query(sql, (err, rows) => {
        console.log('err');
        if (err) throw err;
        console.table(rows);
        init();
    });
};

// add a role to the job_db

addRole = () => {
    let departmentChoices = [];
    let departmentsData = [];
    db.promise().query('SELECT * FROM department')
    .then(([rows,]) => {
        departmentsData = rows;
        rows.map((row) => {
        departmentChoices.push(row.name);
        });
    })
    .then(() => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What is the title of the role?',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role?',
            },
            {
                type: 'list',
                name: 'department',
                message: 'Which department does the role belong to?',
                choices: departmentChoices
            }
        ])
        .then((userInput) => {
            const sql = `INSERT INTO role (title, salary, department_id)` + `VALUES (?, ?, ?)`;
            const departmentName = userInput.department;
            let departmentID;
            departmentsData.forEach((department) => {
                if (department.name === departmentName) {
                    departmentID = department.id;
                }
            }
            );
            const params = [userInput.title, userInput.salary, departmentID];
            db.promise().query(sql, params)
            .then(() => {
                console.log('Role added successfully!');
                init();
            });
        });
    });
};

// view all departments in the job_db

viewAllDepartments = () => {
    const sql = `SELECT * FROM department`;

    db.query(sql, (err, rows) => {
        console.log('err');
        if (err) throw err;
        console.table(rows);
        init();
    });
};

// add a department to the job_db
addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the department?',
        }
    ])
    .then((userInput) => {
        const sql = `INSERT INTO department (name)` + `VALUES (?)`;
        const params = [userInput.name];
        db.promise().query(sql, params)
        .then(() => {
            console.log('Department added successfully!');
            init();
        });
    });
};  

init();










