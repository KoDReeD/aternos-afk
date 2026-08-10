const mineflayer = require('mineflayer');

// НАСТРОЙКИ БОТА ДЛЯ BEDROCK
const config = {
    host: 'kodred_x.aternos.me', // Ваш адрес из панели
    port: 60943,                 // Ваш порт из панели
    username: 'AternosGuard',    // Никнейм бота
    version: '1.20.81'           // Версия Bedrock
};

let bot;

function createBot() {
    console.log(`[Бот] Подключение к Bedrock серверу ${config.host}:${config.port}...`);
    
    bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: config.version,
        // Переключаем протокол библиотеки mineflayer на Bedrock Edition
        botType: 'bedrock' 
    });

    bot.on('spawn', () => {
        console.log('[Бот] Успешно зашел на Bedrock сервер!');
        startAntiAFK();
    });

    bot.on('end', (reason) => {
        console.log(`[Бот] Отключен. Причина: ${reason}. Переподключение через 15 сек...`);
        setTimeout(createBot, 15000);
    });

    bot.on('error', (err) => {
        console.error('[Бот] Ошибка:', err.message);
    });
}

function startAntiAFK() {
    setInterval(() => {
        if (!bot || !bot.entity) return;
        const action = Math.floor(Math.random() * 2);
        switch(action) {
            case 0:
                // Вращение головой
                const yaw = (Math.random() - 0.5) * Math.PI;
                const pitch = (Math.random() - 0.5) * Math.PI / 2;
                bot.look(yaw, pitch);
                break;
            case 1:
                // Прыжок
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 100);
                break;
        }
    }, Math.floor(Math.random() * (20000 - 8000) + 8000));
}

createBot();

// Костыль для удержания Render в сети
const http = require('http');
http.createServer((req, res) => { res.write("Бот Bedrock активен"); res.end(); }).listen(process.env.PORT || 3000);
