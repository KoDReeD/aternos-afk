const bedrock = require('bedrock-protocol');

// НАСТРОЙКИ БОТА ДЛЯ BEDROCK
const config = {
    host: 'kodred_x.aternos.me',
    port: 60943,
    username: 'AternosGuardAuto',
    version: '1.20.80' // Обман версии для совместимости
};

let client;

function createBot() {
    console.log(`[Бот] Подключение к Bedrock серверу ${config.host}:${config.port}...`);
    
    try {
        client = bedrock.createClient({
            host: config.host,
            port: config.port,
            username: config.username,
            version: config.version,
            offline: true,
			skipPing: true
        });

        client.on('join', () => {
            console.log('[Бот] Успешно авторизовался и зашел в мир Bedrock!');
            console.log('[Бот] Режим удержания сервера активен. Бот будет просто стоять.');
        });

        client.on('close', () => {
            console.log('[Бот] Соединение закрыто. Переподключение через 15 секунд...');
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

// Веб-заглушка
const http = require('http');
http.createServer((req, res) => { res.write("Bedrock Бот активен"); res.end(); }).listen(process.env.PORT || 3000);

process.on('SIGINT', () => {
    console.log('\n[Бот] Получен сигнал выключения (Ctrl+C). Корректно закрываем UDP-сессию...');
    
    if (client) {
        // Протокольное закрытие сокета: шлем серверу пакет Disconnect
        client.close(); 
    }
    
    // Небольшой таймаут в 500мс, чтобы пакет успел улететь в сетевой стек, затем убиваем процесс
    setTimeout(() => {
        console.log('[Бот] Процесс успешно завершен. Сессия на сервере свободна.');
        process.exit(0);
    }, 500);
});
