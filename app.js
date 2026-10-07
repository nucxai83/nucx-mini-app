// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Адрес вашего сервера (VPS или другого хостинга)
// Пока сервер не готов, оставьте как есть — кнопки будут показывать сообщение.
const SERVER_URL = 'https://nucxai83.github.io/nucx-mini-app/'; // Замените позже

const statusEl = document.getElementById('status');
const fileListEl = document.getElementById('fileList');

function setStatus(text) {
    statusEl.textContent = text;
}

// --- Отправка задачи в нейросеть ---
async function sendToAI() {
    const task = document.getElementById('taskInput').value.trim();
    if (!task) {
        setStatus('Введите задачу.');
        return;
    }

    setStatus('Отправляю в нейросеть...');

    if (SERVER_URL.includes('ВАШ-СЕРВЕР')) {
        // Заглушка, пока нет сервера
        setStatus('Сервер пока не подключён. Задача: "' + task.substring(0, 50) + '..."');
        return;
    }

    try {
        const resp = await fetch(SERVER_URL + '/api/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: task })
        });
        const data = await resp.json();
        setStatus('Ответ AI:\n' + data.answer);
    } catch (e) {
        setStatus('Ошибка: ' + e.message);
    }
}

// --- Получение файлов с флешки ---
async function getFiles() {
    setStatus('Загружаю список файлов...');
    fileListEl.innerHTML = '';

    if (SERVER_URL.includes('ВАШ-СЕРВЕР')) {
        setStatus('Сервер пока не подключён.');
        return;
    }

    try {
        const resp = await fetch(SERVER_URL + '/api/files');
        const data = await resp.json();
        if (data.files && data.files.length > 0) {
            fileListEl.innerHTML = '<b>Файлы:</b><br>' + data.files.join('<br>');
            setStatus('Получено файлов: ' + data.files.length);
        } else {
            setStatus('Файлов нет.');
        }
    } catch (e) {
        setStatus('Ошибка: ' + e.message);
    }
}

// --- Отправка файла на флешку ---
function uploadToFlash() {
    if (SERVER_URL.includes('ВАШ-СЕРВЕР')) {
        setStatus('Сервер пока не подключён.');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setStatus('Отправляю на флешку...');
        try {
            const resp = await fetch(SERVER_URL + '/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await resp.json();
            setStatus(data.message || 'Файл отправлен!');
        } catch (e) {
            setStatus('Ошибка: ' + e.message);
        }
    };
    input.click();
}
