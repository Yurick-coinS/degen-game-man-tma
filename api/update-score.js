// Запрашиваем наш единый, центральный модуль подключения к базе данных
const pool = require('../db');

// Экспортируем функцию, которую будет вызывать Vercel. Это — наши врата сохранения.
module.exports = async (req, res) => {
	// Принимаем только POST-запросы
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Метод запрещен. Только POST.' });
	}

	try {
		// Извлекаем ID пользователя и его новый счет из тела запроса
		const { userId, newScore } = req.body;

		// Проверка: ID пользователя и счет являются обязательными
		if (!userId || newScore === undefined) {
			return res.status(400).json({ message: 'Ошибка: ID пользователя или новый счет не предоставлены.' });
		}

		// --- Главный акт: Обновление баланса ---
		// Мы используем команду UPDATE, чтобы найти игрока по его user_id
		// и установить его gold_balance в новое значение.
		// RETURNING * возвращает обновленные данные игрока.
		const query = `
      UPDATE players
      SET gold_balance = $1
      WHERE user_id = $2
      RETURNING *;
    `;

		const result = await pool.query(query, [newScore, userId]);

		// Проверка: если ни одна строка не была обновлена (игрока нет), сообщаем об ошибке
		if (result.rowCount === 0) {
			console.log(`Прометей: Попытка обновления для несуществующего user_id ${userId}.`);
			return res.status(404).json({ message: 'Сущность не найдена. Обновление невозможно.' });
		}

		const updatedPlayer = result.rows[0];

		// Отправляем ответ, подтверждающий успешное сохранение
		console.log(`Прометей: Баланс для user_id ${userId} обновлен на ${newScore}.`);
		res.status(200).json({
			message: 'Прогресс успешно сохранен.',
			playerData: {
				userId: updatedPlayer.user_id,
				newGoldBalance: updatedPlayer.gold_balance
			}
		});

	} catch (error) {
		// Если произошла любая ошибка на уровне базы данных
		console.error('Прометей: КРИТИЧЕСКАЯ ОШИБКА СОХРАНЕНИЯ!', error);
		res.status(500).json({
			message: 'Критическая ошибка системы. Сохранение не удалось.',
			error: error.message
		});
	}
};