// ============== ИНИЦИАЛИЗАЦИЯ ==============
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ⚠️ ЗАМЕНИТЕ НА АДРЕС ВАШЕГО СЕРВЕРА
// Пример: 'https://my-server.com' или 'http://192.168.1.100:8000'
const SERVER_URL = 'https://nucxai83.github.io/nucx-mini-app/';

const statusEl = document.getElementById('status');
const fileListEl = document.getElementById('fileList');

function setStatus(text) {
    statusEl.textContent = text;
}

function serverNotConfigured() {
    return SERVER_URL.includes('ВАШ-СЕРВЕР');
}


// ============== ОТПРАВКА ЗАДАЧИ В AI ==============
async function sendToAI() {
    const task = document.getElementById('taskInput').value.trim();
    const model = document.getElementById('modelSelect').value;

    if (!task) {
        setStatus('⚠ Введите задачу.');
        return;
    }

    if (serverNotConfigured()) {
        setStatus(
            '⚠ Сервер пока не подключён.\n\n' +
            'Задача: "' + task.substring(0, 60) + '..."\n' +
            'Модель: ' + model
        );
        return;
    }

    setStatus('🧠 Отправляю в ' + model + '...');

    try {
        const resp = await fetch(SERVER_URL + '/api/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: task, model: model })
        });

        if (!resp.ok) {
            throw new Error('HTTP ' + resp.status);
        }

        const data = await resp.json();
        setStatus('✅ Ответ (' + model + '):\n\n' + data.answer);

    } catch (e) {
        setStatus('❌ Ошибка: ' + e.message);
    }
}


// ============== СПИСОК ФАЙЛОВ С ФЛЕШКИ ==============
async function getFiles() {
    fileListEl.innerHTML = '';

    if (serverNotConfigured()) {
        setStatus('⚠ Сервер пока не подключён.');
        return;
    }

    setStatus('📥 Загружаю список файлов...');

    try {
        const resp = await fetch(SERVER_URL + '/api/files');
        const data = await resp.json();

        if (data.files && data.files.length > 0) {
            fileListEl.innerHTML = '<b>Файлы на сервере:</b><br>' +
                data.files.map(f => '• ' + f).join('<br>');
            setStatus('✅ Найдено файлов: ' + data.files.length);
        } else {
            setStatus('📭 Файлов нет.');
        }
    } catch (e) {
        setStatus('❌ Ошибка: ' + e.message);
    }
}


// ============== ОТПРАВКА ФАЙЛА НА ФЛЕШКУ ==============
function uploadToFlash() {
    if (serverNotConfigured()) {
        setStatus('⚠ Сервер пока не подключён.');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setStatus('📤 Отправляю "' + file.name + '"...');

        try {
            const resp = await fetch(SERVER_URL + '/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await resp.json();
            setStatus('✅ ' + (data.message || 'Файл отправлен!'));
        } catch (e) {
            setStatus('❌ Ошибка: ' + e.message);
        }
    };

    input.click();
}


// ============== СЛУЖЕБНОЕ ==============
// Показать текущий сервер при загрузке (для отладки)
if (serverNotConfigured()) {
    setStatus('⚠ Сервер не настроен.\nОткройте app.js и замените SERVER_URL.');
} else {
    setStatus('✅ Сервер: ' + SERVER_URL);
}
