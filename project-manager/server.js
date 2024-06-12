const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialisation de la base de données SQLite
const db = new sqlite3.Database('projects.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS project (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        end_date TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS task (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        due_date TEXT NOT NULL,
        severity TEXT NOT NULL,
        project_id INTEGER,
        FOREIGN KEY (project_id) REFERENCES project (id)
    )`);
});

// Configuration de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Project Management API',
            version: '1.0.0',
            description: 'API de gestion de projets et de tâches'
        },
    },
    apis: ['./server.js'], // Les fichiers où Swagger va chercher les commentaires
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - end_date
 *       properties:
 *         id:
 *           type: integer
 *           description: L'ID du projet
 *         name:
 *           type: string
 *           description: Le nom du projet
 *         end_date:
 *           type: string
 *           format: date
 *           description: La date de fin du projet
 *       example:
 *         id: 1
 *         name: Mon Projet
 *         end_date: 2024-12-31
 *     Task:
 *       type: object
 *       required:
 *         - description
 *         - due_date
 *         - severity
 *       properties:
 *         id:
 *           type: integer
 *           description: L'ID de la tâche
 *         description:
 *           type: string
 *           description: La description de la tâche
 *         due_date:
 *           type: string
 *           format: date
 *           description: La date d'échéance de la tâche
 *         severity:
 *           type: string
 *           description: La sévérité de la tâche
 *         project_id:
 *           type: integer
 *           description: L'ID du projet associé
 *       example:
 *         id: 1
 *         description: Terminer le rapport
 *         due_date: 2024-06-30
 *         severity: High
 *         project_id: 1
 */

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Gestion des projets
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Retourne la liste des projets
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: La liste des projets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *   post:
 *     summary: Crée un nouveau projet
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Le projet a été créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */

app.get('/projects', (req, res) => {
    db.all('SELECT * FROM project', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/projects', (req, res) => {
    const { name, end_date } = req.body;
    console.log('Received project:', name, end_date); // Débogage
    db.run('INSERT INTO project (name, end_date) VALUES (?, ?)', [name, end_date], function (err) {
        if (err) {
            console.error('Error inserting project:', err.message); // Débogage
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

/**
 * @swagger
 * /projects/{projectId}:
 *   delete:
 *     summary: Supprime un projet
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: L'ID du projet
 *     responses:
 *       200:
 *         description: Le projet a été supprimé
 */

app.delete('/projects/:projectId', (req, res) => {
    const projectId = req.params.projectId;
    db.serialize(() => {
        db.run('DELETE FROM task WHERE project_id = ?', [projectId], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            db.run('DELETE FROM project WHERE id = ?', [projectId], function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: 'Project and its tasks deleted' });
            });
        });
    });
});

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   get:
 *     summary: Retourne la liste des tâches d'un projet
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: L'ID du projet
 *     responses:
 *       200:
 *         description: La liste des tâches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *   post:
 *     summary: Crée une nouvelle tâche pour un projet
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: L'ID du projet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: La tâche a été créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */

app.get('/projects/:projectId/tasks', (req, res) => {
    const projectId = req.params.projectId;
    db.all('SELECT * FROM task WHERE project_id = ?', [projectId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/projects/:projectId/tasks', (req, res) => {
    const projectId = req.params.projectId;
    const { description, due_date, severity } = req.body;
    db.run('INSERT INTO task (description, due_date, severity, project_id) VALUES (?, ?, ?, ?)', 
        [description, due_date, severity, projectId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

/**
 * @swagger
 * /projects/{projectId}/tasks/{taskId}:
 *   delete:
 *     summary: Supprime une tâche
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: L'ID du projet
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: integer
 *         required: true
 *         description: L'ID de la tâche
 *     responses:
 *       200:
 *         description: La tâche a été supprimée
 */

app.delete('/projects/:projectId/tasks/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    db.run('DELETE FROM task WHERE id = ?', [taskId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Task deleted' });
    });
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/api-docs`);
});
