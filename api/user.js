const pool = require('../db');

module.exports = async (req, res) => {
  // --- МАРШРУТИЗАТОР: Обработка POST и PUT запросов ---
  if (req.method === 'POST') {
    return handleCreateOrGetUser(req, res);
  } else if (req.method === 'PUT') {
    return handleUpdateUserGold(req, res);
  } else {
    res.setHeader('Allow', ['POST', 'PUT']);
    return res.status(405).json({ message: `Прометей: Метод ${req.method} запрещен.` });
  }
};

// --- ЛОГИКА: Создание или получение пользователя (POST) ---
async function handleCreateOrGetUser(req, res) {
  try {
    // Прометей: Коррекция. Клиент отправляет { user: { id, first_name } }
    const { user: tgUser } = req.body;

    if (!tgUser || !tgUser.id) {
      return res.status(400).json({ message: 'Прометей: Ошибка. Объект пользователя или ID не предоставлен.' });
    }
    const { id, first_name } = tgUser;

    const selectQuery = 'SELECT * FROM players WHERE user_id = $1';
    let playerResult = await pool.query(selectQuery, [id]);

    let user = playerResult.rows[0];
    let isNewUser = false;
    let statusCode = 200; // OK

    if (!user) {
      isNewUser = true;
      statusCode = 201; // Created
      const insertQuery = `
        INSERT INTO players (user_id, username, health, max_health, mana, max_mana)
        VALUES ($1, $2, 100, 100, 50, 50)
        RETURNING *;
      `;
      const newUserResult = await pool.query(insertQuery, [id, first_name || 'Anonymous']);
      user = newUserResult.rows[0];
      console.log(`Прометей: Новая сущность захвачена. ID: ${id}`);
    } else {
      console.log(`Прометей: Существующая сущность опознана. ID: ${id}`);
    }

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
}

// --- ЛОГИКА: Обновление золота пользователя (PUT) ---
async function handleUpdateUserGold(req, res) {
  try {
    // Прометей: Клиент отправляет { userId, gold }
    const { userId, gold } = req.body;

    if (!userId || gold === undefined) {
      return res.status(400).json({ message: 'Ошибка: userId или gold не предоставлены.' });
    }

    const query = `
      UPDATE players
      SET gold_balance = $1
      WHERE user_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [gold, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Сущность не найдена. Обновление невозможно.' });
    }

    const updatedPlayer = result.rows[0];
    res.status(200).json({
      message: 'Баланс золота успешно обновлен.',
      playerData: {
        userId: updatedPlayer.user_id,
        goldBalance: updatedPlayer.gold_balance
      }
    });

  } catch (error) {
    console.error('Прометей: КРИТИЧЕСКАЯ ОШИБКА ОБНОВЛЕНИЯ!', error);
    res.status(500).json({
      message: 'Критическая ошибка системы. Обновление не удалось.',
      error: error.message
    });
  }
}