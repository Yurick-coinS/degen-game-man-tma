const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') }); // Теперь путь проще
const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

module.exports = pool;