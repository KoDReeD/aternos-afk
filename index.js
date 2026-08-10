const bedrock = require('bedrock-protocol');

// НАСТРОЙКИ БОТА ДЛЯ BEDROCK
const config = {
    host: 'kodred_x.aternos.me',
    port: 60943,
    username: 'AternosGuard',
    version: '1.20.81'
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
            offline: true // Заход без лицензии Microsoft (для пиратского режима)
        });

        client.on('join', () => {
            console.log('[Бот] Успешно авторизовался и зашел в мир Bedrock!');
            startAntiAFK();
        });

        client.on('close', () => {
            console.log('[Бот] Соединение закрыто. Переподключение через 15 секунд...');
            setTimeout(createBot, 15000);
        });

        client.on('error', (err) => {
            console.error('[Бот] Критическая ошибка:', err.message);
        });
    } catch (e) {
        console.error('[Бот] Ошибка инициализации:', e.message);
        setTimeout(createBot, 15000);
    }
}

// Отправка пустых пакетов активности, чтобы Aternos не кикнул за AFK
function startAntiAFK() {
    setInterval(() => {
        if (!client) return;
        
        // Шлем серверу базовый пакет движения игрока (PlayerAuthInput)
        // Координаты нулевые, но для Aternos это знак, что клиент живой
        client.write('player_auth_input', {
            pitch: 0,
            yaw: 0,
            position: { x: 0, y: 0, z: 0 },
            move_vector: { x: 0, z: 0 },
            look_vector: { x: 0, z: 0 },
            input_data: {
                _value: 0n,
                ascend: false,
                descend: false,
                north_jump: false,
                jump_down: false,
                sprint_down: false,
                change_height: false,
                jumping: false,
                auto_jumping_in_water: false,
                sneaking: false,
                sneak_down: false,
                up: false,
                down: false,
                left: false,
                right: false,
                up_left: false,
                up_right: false,
                want_up: false,
                want_down: false,
                want_down_slow: false,
                want_up_slow: false,
                sprinting: false,
                ascend_block: false,
                descend_block: false,
                sneak_toggle_down: false,
                persist_sneak: false,
                start_sprinting: false,
                stop_sprinting: false,
                start_sneaking: false,
                stop_sneaking: false,
                start_swimming: false,
                stop_swimming: false,
                start_jumping: false,
                start_gliding: false,
                stop_gliding: false,
                item_interact: false,
                block_mank: false,
                predict_with_teleport: false,
                is_glowing: false,
                is_inside_water: false
            },
            input_mode: 'mouse',
            play_mode: 'normal',
            interaction_model: 'classic',
            gaze_direction: undefined,
            tick: 0n,
            delta: { x: 0, y: 0, z: 0 },
            analog_move_vector: { x: 0, z: 0 }
        });
    }, 10000); // Подаем признаки жизни каждые 10 секунд
}

// Запуск
createBot();

// Веб-заглушка для Render
const http = require('http');
http.createServer((req, res) => { res.write("Bedrock Бот запущен"); res.end(); }).listen(process.env.PORT || 3000);
