import { pool } from './connection.js';
// import inquirer from inquirer
async function init() {
    const result = await pool.query('SELECT * from employees');
    console.table(result.rows);
}
init();
