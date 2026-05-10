const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'mysql',
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME || 'virtual_court',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '12211144',
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        port: process.env.DB_PORT || 3307,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
      }
    );

module.exports = sequelize;
