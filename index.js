const bedrock = require('bedrock-protocol');
const crypto = require('crypto');

// НАСТРОЙКИ БОТА ДЛЯ BEDROCK
const config = {
    host: 'kodred_x.aternos.me',
    port: 60943,
    version: '1.20.80' // Обман версии для совместимости
};

let client;
let afkInterval;

function createBot() {
    // Генерируем случайный ник при каждом перезаходе (например, Guard_a1b2)
    // Это нужно, чтобы избежать ошибки "loggedinOtherLocation", если прошлая сессия зависла в памяти Aternos
    const randomId = crypto.randomBytes(2).toString('hex');
    const currentUsername = `Guard_${randomId}`;

    console.log(`[Бот] Подключение к Bedrock серверу ${config.host}:${config.port} под ником ${currentUsername}...`);
    
    try {
        client = bedrock.createClient({
            host: config.host,
            port: config.port,
            username: currentUsername,
            version: config.version,
            offline: true,
            skipPing: true,
            raknetBackend: 'raknet-node', 
            clientGUID: crypto.randomBytes(8).readBigUInt64BE() // Генерируем уникальный ID устройства
        });

        client.on('join', () => {
            console.log(`[Бот] Успешно авторизовался и зашел в мир под ником ${currentUsername}!`);
            console.log('[Бот] Режим удержания сервера активен.');

            // ИСПРАВЛЕНИЕ БЕЗДЕЙСТВИЯ: Очищаем старый интервал и запускаем новый
            clearInterval(afkInterval);
            afkInterval = setInterval(() => {
                if (client && client.status === 'playing') {
                    // Отправляем пакет чата. Сервер видит активность и сбрасывает AFK-таймер
                    client.write('text', {
                        type: 'chat',
                        needs_translation: false,
                        source_name: currentUsername,
                        xuid: '',
                        platform_chat_id: '',
                        message: 'привет, красотка!' // Бот будет писать точку в чат раз в 2 минуты
                    });
                    console.log('[Бот] Отправлен пакет активности в чат для сброса AFK.');
                }
            }, 120000); // 120000 мс = 2 минуты
        });

        client.on('close', (reason) => {
            clearInterval(afkInterval);
            console.log(`[Бот] Соединение закрыто. Причина: ${reason || 'Таймаут или Render уснул'}. Переподключение через 15 секунд...`);
            setTimeout(createBot, 15000);
        });

        client.on('error', (err) => {
            console.error('[Бот] Ошибка протокола:', err.message);
        });
    } catch (e) {
        console.error('[Бот] Ошибка инициализации:', e.message);
        setTimeout(createBot, 15000);
    }
}

// Запуск
createBot();

// Веб-заглушка для Render и внешних пингеров
const http = require('http');
http.createServer((req, res) => { 
    res.write("Bedrock Бот активен"); 
    res.end(); 
}).listen(process.env.PORT || 3000);

process.on('SIGINT', () => {
    console.log('\n[Бот] Получен сигнал выключения (Ctrl+C)...');
    clearInterval(afkInterval);
    if (client) client.close(); 
    setTimeout(() => process.exit(0), 500);
});
