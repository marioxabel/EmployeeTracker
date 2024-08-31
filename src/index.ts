import inquirer from 'inquirer'
import { getAllEmployees, addEmployee, getAllRoles, addRole, getAllDepartments, addDepartment, 
    greeting, updateEmployeeRole, updateEmployeManager, getEmployeesFromManager,
    getEmployeesByDepartment, getTotalBudgetByDepartment }  from './employeeFunctions.js'

const StartMenu: Object[] = [
    {
        type: 'list',
        name: 'item',
        message: 'What would you like to do',
        choices: [
            'View All Departments',
            'View All Roles',
            'View All Employees',
            'Add Department',
            'Add Role',
            'Add Employee',
            'Update Employee Role',
            'Update Employee Manager',
            'View Employees by Manager',
            'View Employees by Department',
            'View Total Budget by Department'
        ]
    }
]


async function init() {
    const { item } = await inquirer.prompt(StartMenu)

    switch (item) {
        case 'View All Employees':
            console.table(await getAllEmployees())
            break
        case 'Add Employee':
            await addEmployee()
            break
        case 'Update Employee Role':
            await updateEmployeeRole()
            break
        case 'View All Roles':
            console.table(await getAllRoles())
            break
        case 'Add Role':
            await addRole()
            break
        case 'View All Departments':
            console.table(await getAllDepartments())
            break
        case 'Add Department':
            await addDepartment()
            break
        case 'Update Employee Manager':
            await updateEmployeManager()
            break
        case 'View Employees by Manager':
            console.table(await getEmployeesFromManager())
            break
        case 'View Employees by Department':
            console.table(await getEmployeesByDepartment())
            break
        case 'View Total Budget by Department':
            await getTotalBudgetByDepartment()
            break
    }
    init()
}



greeting()
init()