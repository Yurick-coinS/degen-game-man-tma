const { Pool } = require('pg');

// Прометей: Конфигурация dotenv удалена.
// В среде Vercel переменные окружения, такие как DATABASE_URL,
// инжектируются непосредственно в процесс. Модуль dotenv не требуется.

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;