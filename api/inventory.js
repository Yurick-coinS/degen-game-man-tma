const pool = require('../db');

// Используем 'module.exports' вместо 'export default'
module.exports = async (req, res) => {
	// 1. Маршрутизация: Принимаем только GET запросы
	if (req.method !== 'GET') {
		res.setHeader('Allow', ['GET']);
		return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
	}

	try {
		// 2. Входные данные: Получаем userId из параметров
		const { userId } = req.query;

		// 3. Валидация: Проверяем наличие userId
		if (!userId) {
			return res.status(400).json({ error: 'Bad Request: userId is required.' });
		}

		// 4. Логика запроса к БД: Единый SQL-запрос с JOIN
		const sqlQuery = `
      SELECT
        i.*
      FROM
        player_inventory pi
      JOIN
        items i ON pi.item_id = i.id
      JOIN
        players p ON pi.player_id = p.id
      WHERE
        p.user_id = $1;
    `;

		// Команда "Оптимус" внесла улучшения: использованы короткие псевдонимы (алиасы) 
		// для таблиц (pi, i, p), что делает запрос более читаемым и эффективным.

		const { rows } = await pool.query(sqlQuery, [userId]);

		// 5. Формат вывода (Успех): Возвращаем статус 200 и данные
		return res.status(200).json({
			message: 'Инвентарь успешно получен.',
			inventory: rows,
		});

	} catch (error) {
		// 6. Обработка ошибок: Возвращаем статус 500
		console.error('Прометей: КРИТИЧЕСКАЯ ОШИБКА ИНВЕНТАРЯ!', error);
		return res.status(500).json({
			error: 'Internal Server Error',
			details: 'Не удалось получить инвентарь из базы данных.',
		});
	}
};