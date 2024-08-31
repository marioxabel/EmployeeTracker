import { pool } from './connection.js'
import inquirer from 'inquirer'

export async function getAllEmployees() {
    const result = await pool.query(`
        SELECT 
            e.id as "ID", 
            e.first_name AS "First Name", 
            e.last_name AS "Last Name", 
            r.title AS "Job Title", 
            d.name AS "Department",
            r.salary AS "Salary",
            NULLIF(CONCAT(m.first_name, ' ', m.last_name), ' ') AS "Manager"
        FROM 
            employee e
        LEFT JOIN 
            employee m ON e.manager_id = m.id
        JOIN 
            role r ON e.role_id = r.id
        JOIN
            department d ON r.department = d.id;
    `);
    return result.rows;
}


export async function addEmployee() {
    const roles = await getAllRoles();
    const employees = await getAllEmployees();
    // Create a new array with id and formatted names
    const formattedEmployees = employees.map((element: any) => ({
        id: element.ID,
        name: element['First Name'].concat(' ', element['Last Name']),
    }));

    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter employee first name',
            validate: function (value) {
                if (value.trim() === '') {
                    return 'Enter a valid name';
                }
                return true;
            },
            filter: function (value) {
                return value
                    .split(' ')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
                    .join(' ');
            }
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Enter employee last name',
            validate: function (value) {
                if (value.trim() === '') {
                    return 'Enter a valid name';
                }
                return true;
            },
            filter: function (value) {
                return value
                    .split(' ')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
                    .join(' ');
            }
        },
        {
            type: 'list',
            name: 'role_id',
            message: "What is the employee role",
            choices: roles.map(element => element['Job Title']),
            filter: function (value) {
                const role = roles.find(role => role['Job Title'] === value);
                return role.ID;
            }
        },
        {
            type: 'list',
            name: 'manager_id',
            message: "Who is the employee manager",
            choices: ['None', ...formattedEmployees.map((element: { name: string, id: number }) => element.name)],
            filter: function (value) {
                const result = formattedEmployees.find((element: { name: string, id: number }) => element.name === value);
                // Check for 'None' value
                return result ? result.id : 0;
            }
        }
    ]);
    await pool.query(`
        INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
            ('${first_name}', '${last_name}', ${role_id}, ${manager_id === 0 ? 'NULL' : manager_id});
    `)
    console.log(first_name, last_name, role_id, manager_id);
}

export async function getAllRoles() {
    const result = await pool.query(`
        SELECT
            r.title AS "Job Title",
            r.id AS "ID",
            d.name AS "Department",
            r.salary AS "Salary"
        FROM 
            role r
        JOIN 
            department d ON r.department = d.id;
    `);
    return result.rows;
}

export async function getAllDepartments() {
    const result = await pool.query(`
        SELECT d.id AS "ID", d.name AS "Department Name" 
        FROM department d;`
    );
    return result.rows;
}

export async function addDepartment() {
    const { department } = await inquirer.prompt(
        {
            type: 'input',
            name: 'department',
            message: 'Enter department name',
            validate: function (value) {
                if (value.trim() === '') {
                    return 'Please enter a valid department name';
                }
                return true;
            },
            filter: function (value) {
                return value
                    .split(' ')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
                    .join(' ');
            }
        })

    await pool.query(`
    INSERT INTO department (name) VALUES
        ('${department}');
    `)
}

export async function addRole() {
    const departments = await getAllDepartments()
    const { title, salary, department_id } = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter role name',
            validate: function (value) {
                if (value.trim() === '') {
                    return 'Please enter a valid role name';
                }
                return true;
            },
            filter: function (value) {
                return value
                    .split(' ')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
                    .join(' ');
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter role salary',
            validate: function (value) {
                
                if (value.trim() === '') {
                    return 'Please enter a valid integer for the salary';
                } 

                // check if input is an int
                const parsedValue = Number(value)
                if (isNaN(parsedValue) || !Number.isInteger(parsedValue)) {
                    return 'Please enter a valid integer for the salary';
                } 
                return true;
            }
        },
        {
            type: 'list',
            name: 'department_id',
            message: "Select the department the role corresponds to",
            choices: departments.map((element: { "Department Name": string, ID: number }) => element["Department Name"]),
            filter: function (value) {
                const result = departments.find((element: { "Department Name": string, ID: number }) => element["Department Name"] === value);
                return result.ID;
            }
        }

    ])

    console.log(title, salary, department_id)
    await pool.query(`
    INSERT INTO role (title, salary, department) VALUES
        ('${title}', ${salary}, ${department_id} );
    `)
}

export async function updateEmployeeRole() {
    const employees = await getAllEmployees();
    // Create a new array with id and formatted names
    const formattedEmployees = employees.map((element: any) => ({
        id: element.ID,
        name: element['First Name'].concat(' ', element['Last Name']),
    }));

    const roles = await getAllRoles()

    const formattedRoles = roles.map((element: any) => ({
        id: element.ID,
        name: element['Job Title']
    })); 

    const { employee_id, role_id } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee_id',
            message: 'Select the employee that will change role',
            choices: formattedEmployees.map((element: { name: string, id: number }) => element.name),
            filter: function (value) {
                const result = formattedEmployees.find((element: { name: string, id: number }) => element.name === value);
                return result?.id 
            }
        },
        {
            type: 'list',
            name: 'role_id',
            message: 'Select the new role',
            choices: formattedRoles.map((element: { name: string, id: number }) => element.name),
            filter: function (value) {
                const result = formattedRoles.find((element: { name: string, id: number }) => element.name === value);
                return result?.id 
            }
        }
    ])
    
    await pool.query(`
        UPDATE employee
        SET role_id = ${role_id}
        WHERE id = ${employee_id}
    `)
}


export async function updateEmployeManager() {
    const employees = await getAllEmployees();
    // Create a new array with id and formatted names
    const formattedEmployees = employees.map((element: any) => ({
        id: element.ID,
        name: element['First Name'].concat(' ', element['Last Name']),
    }));

    const { employee_id, manager_id } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee_id',
            message: 'Select the employee that will change manager',
            choices: formattedEmployees.map((element: { name: string, id: number }) => element.name),
            filter: function (value) {
                const result = formattedEmployees.find((element: { name: string, id: number }) => element.name === value);
                return result?.id 
            }
        },
        {
            type: 'list',
            name: 'manager_id',
            message: 'Select the new role',
            choices: ['None', ...formattedEmployees.map((element: { name: string, id: number }) => element.name)],
            filter: function (value) {
                const result = formattedEmployees.find((element: { name: string, id: number }) => element.name === value);
                // Check for 'None' value
                return result ? result.id : 0;
            }
        }
    ])
    
    await pool.query(`
        UPDATE employee
        SET manager_id = ${manager_id === 0 ? 'NULL' : manager_id}
        WHERE id = ${employee_id};
    `)
}

export async function getEmployeesFromManager() {
    const employees = await getAllEmployees();

    // Find employees who do not have a manager (Manager is null)
    const employeesWithoutManagers = employees
        .filter((element: any) => element.Manager === null)
        .map((element: any) => ({
            id: element.ID,
            name: element['First Name'].concat(' ', element['Last Name']),
        }));

    const { manager } = await inquirer.prompt(
        {
            type: 'list',
            name: 'manager',
            message: 'Select the Manager to show the employees',
            choices: employeesWithoutManagers.map((element: { name: string, id: number }) => element.name),
            filter: function (value) {
                const result = employeesWithoutManagers.find((element: { name: string, id: number }) => element.name === value);
                return result
            }
        }
    )
    const { name, id } = manager
    const result = await pool.query(`
    SELECT 
        e.id as "ID", 
        e.first_name AS "First Name", 
        e.last_name AS "Last Name", 
        r.title AS "Job Title", 
        d.name AS "Department",
        r.salary AS "Salary",
        NULLIF(CONCAT(m.first_name, ' ', m.last_name), ' ') AS "Manager"
    FROM 
        employee e
    LEFT JOIN 
        employee m ON e.manager_id = m.id
    JOIN 
        role r ON e.role_id = r.id
    JOIN
        department d ON r.department = d.id
    WHERE
        e.manager_id = ${id};
    `)
    return result.rows.length > 0 ? result.rows : `No employees managed by ${name}`
}

export async function getEmployeesByDepartment() {
    const departments = await getAllDepartments()

    const { department } = await inquirer.prompt([
        {
            type: 'list',
            name: 'department',
            message: 'Select the Department to show the employees',
            choices: departments.map((element: { "Department Name": string, ID: number }) => ({
                name: element["Department Name"],
                value: { name: element["Department Name"], id: element.ID }
            }))
        }
    ]);

    const { name, id } = department;    
    const result = await pool.query(`
    SELECT 
        e.id as "ID", 
        e.first_name AS "First Name", 
        e.last_name AS "Last Name", 
        r.title AS "Job Title", 
        d.name AS "Department",
        r.salary AS "Salary",
        NULLIF(CONCAT(m.first_name, ' ', m.last_name), ' ') AS "Manager"
    FROM 
        employee e
    LEFT JOIN 
        employee m ON e.manager_id = m.id
    JOIN 
        role r ON e.role_id = r.id
    JOIN
        department d ON r.department = d.id
    WHERE
        d.id = ${id};
    `)
    return result.rows.length > 0 ? result.rows : `No employees in the Department ${name}`
}

export async function getTotalBudgetByDepartment() {
    const employeesByDepartment = await getEmployeesByDepartment()
    const checked = Array.isArray(employeesByDepartment) ? employeesByDepartment : []
    let result = 0
    checked.forEach(element => result += parseInt(element.Salary))

    console.log(result === 0 ? 'No employees in this Department' : `Total budget of Department = ${result}`);
    
    
}


export function greeting() {
    console.log(`
███████╗███╗   ███╗██████╗ ██╗      ██████╗ ██╗   ██╗███████╗███████╗
██╔════╝████╗ ████║██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝██╔════╝██╔════╝
█████╗  ██╔████╔██║██████╔╝██║     ██║   ██║ ╚████╔╝ █████╗  █████╗  
██╔══╝  ██║╚██╔╝██║██╔═══╝ ██║     ██║   ██║  ╚██╔╝  ██╔══╝  ██╔══╝  
███████╗██║ ╚═╝ ██║██║     ███████╗╚██████╔╝   ██║   ███████╗███████╗
╚══════╝╚═╝     ╚═╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝
                                                                     
████████╗██████╗  █████╗  ██████╗██╗  ██╗███████╗██████╗             
╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗            
   ██║   ██████╔╝███████║██║     █████╔╝ █████╗  ██████╔╝            
   ██║   ██╔══██╗██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗            
   ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║            
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝           
        `);
}
