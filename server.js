const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3000;

// Підключення middleware для обробки JSON та роздачі статичних файлів
app.use(express.json());
app.use(express.static('public'));

// Ініціалізація бази даних SQLite
const db = new Database('tasks.db');

// Створення таблиці, якщо її не існує
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL
  )
`);

// --- REST API МАРШРУТИ ---

// 1. GET - отримати всі завдання
app.get('/api/tasks', (req, res) => {
    try {
        const tasks = db.prepare('SELECT * FROM tasks').all();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. POST - додати нове завдання
app.post('/api/tasks', (req, res) => {
    try {
        const { title } = req.body;
        
        // Валідація
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Назва завдання не може бути порожньою' });
        }

        const info = db.prepare('INSERT INTO tasks (title) VALUES (?)').run(title);
        
        // Повертаємо створене завдання
        const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. DELETE - видалити завдання за ID
app.delete('/api/tasks/:id', (req, res) => {
    try {
        const { id } = req.params;
        const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
        
        if (info.changes === 0) {
            return res.status(404).json({ error: 'Завдання не знайдено' });
        }
        res.json({ message: 'Завдання видалено' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- БОНУС: PUT - редагувати завдання ---
app.put('/api/tasks/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Назва не може бути порожньою' });
        }

        const info = db.prepare('UPDATE tasks SET title = ? WHERE id = ?').run(title, id);
        
        if (info.changes === 0) {
            return res.status(404).json({ error: 'Завдання не знайдено' });
        }
        res.json({ message: 'Завдання оновлено', id, title });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:${PORT}`);
});
