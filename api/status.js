const pool = require('../db');

module.exports = async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      
      console.log('Прометей: Рукопожатие успешно. Статус: ОНЛАЙН.');
      res.status(200).json({ 
        status: 'online',
        message: 'Прометей: Рукопожатие с базой данных успешно. Система видит матрицу.',
        time: result.rows[0].now 
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Прометей: КРИТИЧЕСКАЯ ОШИБКА СТАТУСА!', error);
    res.status(500).json({ 
      status: 'offline',
      message: 'Прометей: КРИТИЧЕСКАЯ ОШИБКА! Не удалось установить рукопожатие с базой данных.',
      error: error.message
    });
  }
};