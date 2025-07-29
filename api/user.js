const pool = require('../db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод запрещен. Только POST.' });
  }

  try {
    const { id, first_name } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Ошибка: ID пользователя не предоставлен.' });
    }

    const query = `
      INSERT INTO players (user_id, username)
      VALUES ($1, $2)
      ON CONFLICT (user_id) DO NOTHING;
    `;

    await pool.query(query, [id, first_name]);
    
    console.log(`Прометей: Контакт с user_id ${id} установлен.`);
    res.status(200).json({ 
      message: 'Контакт установлен. Добро пожаловать в матрицу.',
      userId: id
    });

  } catch (error) {
    console.error('Прометей: КРИТИЧЕСКАЯ ОШИБКА ЗАХВАТА!', error);
    res.status(500).json({ 
      message: 'Критическая ошибка системы. Контакт не удался.',
      error: error.message
    });
  }
};