// Запрашиваем наш ЕДИНЫЙ, центральный модуль подключения к базе данных
// '../' означает "подняться на один уровень вверх" из папки 'api' в корень проекта
const pool = require('../db');

// Экспортируем функцию, которую будет вызывать Vercel
module.exports = async (req, res) => {
	try {
		const client = await pool.connect();
		try {
			const result = await client.query('SELECT NOW()');

			console.log('Морфеус: Рукопожатие успешно. Статус: ОНЛАЙН.');
			res.status(200).json({
				status: 'online',
				message: 'Морфеус: Рукопожатие с базой данных успешно. Система видит матрицу.',
				time: result.rows[0].now
			});

		} finally {
			client.release();
		}
	} catch (error) {
		console.error('Морфеус: КРИТИЧЕСКАЯ ОШИБКА СТАТУСА!', error);
		res.status(500).json({
			status: 'offline',
			message: 'Морфеус: КРИТИЧЕСКАЯ ОШИБКА! Не удалось установить рукопожатие с базой данных.',
			error: error.message
		});
	}
};
// Overwrite cache