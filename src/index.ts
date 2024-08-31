import inquirer from 'inquirer'
import { getAllEmployees, addEmployee, getAllRoles, getAllDepartments, greeting, rando }  from './employeeFunctions.js'

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
            await rando()
            break
        case 'View All Roles':
            console.table(await getAllRoles())
            break
        case 'Add Role':
            await rando()
            break
        case 'View All Departments':
            console.table(await getAllDepartments())
            break
        case 'Add Department':
            await rando()
            break
    }
    init()
}



greeting()
init()