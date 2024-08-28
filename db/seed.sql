INSERT INTO department (name) VALUES
('Engineering'),
('Human Resources'),
('Finance'),
('Sales');

INSERT INTO role (title, salary, department) VALUES
('Software Engineer', 70000, 1),
('HR Manager', 60000, 2),
('Financial Analyst', 65000, 3),
('Sales Representative', 55000, 4),
('Senior Engineer', 90000, 1),
('HR Assistant', 40000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),    -- Top-level employee with no manager
('Jane', 'Smith', 2, NULL),  -- Top-level HR Manager with no manager
('Emily', 'Johnson', 3, 2),  -- Reports to HR Manager
('Michael', 'Brown', 4, NULL), -- Top-level Sales Representative
('Chris', 'Davis', 5, 1),    -- Senior Engineer reports to John Doe
('Anna', 'Wilson', 6, 2);    -- HR Assistant reports to Jane Smith
