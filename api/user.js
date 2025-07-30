// Запрашиваем наш единый, центральный модуль подключения к базе данных
const pool = require('../db');

// Экспортируем функцию, которую будет вызывать Vercel. Это — наш шлюз.
module.exports = async (req, res) => {
  // Мы принимаем запросы только методом POST для безопасности
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод запрещен. Только POST.' });
  }

  try {
    // Извлекаем данные, которые пришлет нам клиент (игра)
    const { id, first_name } = req.body;

    // Проверка: ID пользователя является обязательным
    if (!id) {
      return res.status(400).json({ message: 'Ошибка: ID пользователя не предоставлен.' });
    }

    // --- Главный акт: Распознавание или Создание ---

    // Сначала, пытаемся найти существующего игрока
    let playerQuery = await pool.query('SELECT * FROM players WHERE user_id = $1', [id]);

    let user = playerQuery.rows[0];
    let isNewUser = false;

    // Если игрок не найден (результат пуст), мы его создаем
    if (!user) {
      isNewUser = true;
      const insertQuery = `
        INSERT INTO players (user_id, username)
        VALUES ($1, $2)
        RETURNING *; 
      `;
      // Выполняем запрос на вставку и немедленно получаем обратно данные нового игрока
      const newUserResult = await pool.query(insertQuery, [id, first_name || 'Anonymous']);
      user = newUserResult.rows[0];
      console.log(`Прометей: Новая сущность захвачена. ID: ${id}`);
    } else {
      console.log(`Прометей: Существующая сущность опознана. ID: ${id}`);
    }

    // Отправляем финальный, полный ответ клиенту
    res.status(isNewUser ? 201 : 200).json({
      message: isNewUser ? 'Сущность создана и опознана.' : 'Сущность опознана.',
      playerData: {
        id: user.id, // внутренний ID из базы
        userId: user.user_id, // ID из Telegram
        username: user.username,
        goldBalance: user.gold_balance,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    // Если произошла любая ошибка на уровне базы данных
    console.error('Прометей: КРИТИЧЕСКАЯ ОШИБКА ШЛЮЗА!', error);
    res.status(500).json({
      message: 'Критическая ошибка системы. Опознание не удалось.',
      error: error.message
    });
  }
};