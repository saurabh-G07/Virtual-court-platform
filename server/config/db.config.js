const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'virtual_court',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '1221144',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3307, // Try 3307 if 3306 doesn't work
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

module.exports = sequelize;
