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
    // Оставляем динамический ник, чтобы сессии не конфликтовали при реконнекте
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
            skipPing: true // Игнорируем предварительный пинг
            // РЕШЕНИЕ: Убрали raknetBackend и clientGUID, вызывавшие ошибку синтаксиса сокета на Linux
        });

        client.on('join', () => {
            console.log(`[Бот] Успешно авторизовался и зашел в мир под ником ${currentUsername}!`);
            console.log('[Бот] Режим удержания сервера активен.');

            // ИСПРАВЛЕНИЕ БЕЗДЕЙСТВИЯ (AFK)
            // Каждые 2 минуты отправляем точку в чат, чтобы Aternos видел активность и не кикал
            clearInterval(afkInterval);
            afkInterval = setInterval(() => {
                if (client && client.status === 'playing') {
                    client.write('text', {
                        type: 'chat',
                        needs_translation: false,
                        source_name: currentUsername,
                        xuid: '',
                        platform_chat_id: '',
                        message: 'привет, красотка!' // Точка в чат раз в 2 минуты
                    });
                    console.log('[Бот] Отправлен пакет чата для сброса AFK.');
                }
            }, 120000); 
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

// Веб-заглушка для Render и UptimeRobot
const http = require('http');
http.createServer((req, res) => { 
    res.write("Bedrock Бот активен"); 
    res.end(); 
}).listen(process.env.PORT || 3000);

process.on('SIGINT', () => {
    console.log('\n[Бот] Выключение...');
    clearInterval(afkInterval);
    if (client) client.close(); 
    setTimeout(() => process.exit(0), 500);
});
