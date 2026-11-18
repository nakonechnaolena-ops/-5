const API_URL = '/api/tasks';
const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');

// 1. READ: Отримати та відобразити завдання
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        
        taskList.innerHTML = ''; // Очищаємо список перед оновленням
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            
            // Текст завдання
            const span = document.createElement('span');
            span.className = 'task-title';
            span.textContent = task.title;
            // Бонус: редагування по кліку
            span.onclick = () => editTask(task.id, task.title);
            
            // Кнопка видалення
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Видалити';
            deleteBtn.onclick = () => deleteTask(task.id);
            
            li.appendChild(span);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    } catch (error) {
        console.error('Помилка завантаження:', error);
    }
}

// 2. CREATE: Додати завдання
async function addTask() {
    const title = taskInput.value.trim();
    if (!title) return; // Не додаємо порожні

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        
        if (response.ok) {
            taskInput.value = ''; // Очищаємо поле
            fetchTasks(); // Оновлюємо список
        }
    } catch (error) {
        console.error('Помилка додавання:', error);
    }
}

// 3. DELETE: Видалити завдання
async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            fetchTasks(); // Оновлюємо список
        }
    } catch (error) {
        console.error('Помилка видалення:', error);
    }
}

// БОНУС: UPDATE: Редагування завдання
async function editTask(id, oldTitle) {
    const newTitle = prompt('Редагувати завдання:', oldTitle);
    
    // Якщо натиснули "Скасувати" або залишили порожнім — нічого не робимо
    if (newTitle === null || newTitle.trim() === '' || newTitle === oldTitle) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle.trim() })
        });
        
        if (response.ok) {
            fetchTasks(); // Оновлюємо список
        }
    } catch (error) {
        console.error('Помилка редагування:', error);
    }
}

// Дозволяємо додавати завдання натисканням клавіші Enter
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

// Запускаємо завантаження при старті
fetchTasks();
