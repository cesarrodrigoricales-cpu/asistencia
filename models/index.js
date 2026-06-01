const { Sequelize } = require('sequelize');
const config        = require('../config/database');

const env      = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host:    dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false
  }
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Cargar models
db.Course     = require('./Course')(sequelize);
db.Student    = require('./Student')(sequelize);
db.Attendance = require('./Attendance')(sequelize);

// Ejecutar asociaciones
Object.values(db)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(db));

module.exports = db;