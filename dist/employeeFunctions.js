import { pool } from './connection.js';
import inquirer from 'inquirer';
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
    const formattedEmployees = employees.map((element) => ({
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
            choices: ['None', ...formattedEmployees.map((element) => element.name)],
            filter: function (value) {
                const result = formattedEmployees.find((element) => element.name === value);
                // Check for 'None' value
                return result ? result.id : 0;
            }
        }
    ]);
    pool.query(`
        INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
            ('${first_name}', '${last_name}', ${role_id}, ${manager_id === 0 ? 'NULL' : manager_id});
    `);
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
    const result = await pool.query('SELECT * FROM department');
    return result.rows;
}
export async function rando() {
    return 1;
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
