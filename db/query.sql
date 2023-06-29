SELECT departments.id, roles.departments_id
FROM departments
JOIN roles
ON departments.id = roles.departments_id;

SELECT roles.id, employees.roles_id
FROM roles
JOIN employees
ON roles.id = employees.roles_id;

SELECT employees.id, e.manager_id
FROM employees
JOIN employees AS e
ON employees.id = e.manager_id;