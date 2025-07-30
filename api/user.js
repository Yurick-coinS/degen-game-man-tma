// Запрашиваем наш единый, центральный модуль подключения к базе данных
const pool = require('../db');

// Экспортируем функцию в формате CommonJS, совместимом с Vercel
module.exports = async (req, res) => {
  // Принимаем запросы только методом POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Прометей: Метод запрещен. Только POST.' });
  }

  try {
    const { id, first_name } = req.body;

    // Валидация входных данных
    if (!id) {
      return res.status(400).json({ message: 'Прометей: Ошибка. ID пользователя не предоставлен.' });
    }

    // --- Главный акт: Распознавание или Создание ---

    // Пытаемся найти существующего игрока и получить все его данные
    const selectQuery = 'SELECT * FROM players WHERE user_id = $1';
    let playerResult = await pool.query(selectQuery, [id]);

    let user = playerResult.rows[0];
    let isNewUser = false;
    let statusCode = 200; // OK (для существующего пользователя)

    // Если игрок не найден, создаем его с начальными параметрами
    if (!user) {
      isNewUser = true;
      statusCode = 201; // Created (для нового пользователя)

      const insertQuery = `
        INSERT INTO players (user_id, username, health, max_health, mana, max_mana)
        VALUES ($1, $2, 100, 100, 50, 50)
        RETURNING *; 
      `;
      // gold_balance будет установлен в 0 по умолчанию, как мы задали в базе данных
      const newUserResult = await pool.query(insertQuery, [id, first_name || 'Anonymous']);
      user = newUserResult.rows[0];
      console.log(`Прометей: Новая сущность захвачена. ID: ${id}`);
    } else {
      console.log(`Прометей: Существующая сущность опознана. ID: ${id}`);
    }

    // Формируем финальный, консистентный ответ
    res.status(statusCode).json({
      message: isNewUser ? 'Сущность создана и опознана.' : 'Сущность опознана.',
      playerData: {
        id: user.id,
        userId: user.user_id,
        username: user.username,
        goldBalance: user.gold_balance,
        health: user.health,
        maxHealth: user.max_health,
        mana: user.mana,
        maxMana: user.max_mana,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Прометей: КРИТИЧЕСКАЯ ОШИБКА ШЛЮЗА!', error);
    res.status(500).json({
      message: 'Критическая ошибка системы. Опознание не удалось.',
      error: error.message
    });
  }
};