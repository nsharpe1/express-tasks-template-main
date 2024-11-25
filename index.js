const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'Keyin123',
    port: 5432,
});

// Middleware to parse JSON requests
app.use(express.json());

// Function to create tasks table
async function createTasksTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                description TEXT NOT NULL,
                status TEXT NOT NULL
            );
        `);
        console.log("Tasks table created sucessfully.")
    } 
    catch (error) {
        console.error("Error creating tasks table:", error);
    }
}

// GET /tasks - Get all tasks
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks');
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// POST /tasks - Add a new task
app.post('/tasks', async (request, response) => {
    const { description, status } = request.body;
    try {
        const result = await pool.query('INSERT INTO tasks (description, status) VALUES ($1, $2) RETURNING *', [description, status]);
        response.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        response.status(500).send('Server error');
    }
});

// PUT /tasks/:id - Update a task's status
app.put('/tasks/:id', async (request, response) => {
    const { id } = request.params;
    const { status } = request.body;
    try {
        const result = await pool.query('UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
        if (result.rows.length === 0) {
            return response.status(404).send('Task not found');
        }
        response.json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        response.status(500).send('Server error');
    }
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', async (request, response) => {
    const { id } = request.params;
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return response.status(404).send('Task not found');
        }
        response.status(204).send();
    }
    catch (error) {
        console.error(error);
        response.status(500).send('Server error');
    }
});

createTasksTable()
    .then(() => app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`)));