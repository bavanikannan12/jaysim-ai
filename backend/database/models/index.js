const { sequelize, testConnection } = require('../connection');
const Session = require('./Session');
const Message = require('./Message');

// Define associations
Session.hasMany(Message, { foreignKey: 'sessionId', sourceKey: 'sessionId', as: 'messages' });
Message.belongsTo(Session, { foreignKey: 'sessionId', targetKey: 'sessionId', as: 'session' });

// Initialize database (create tables)
const initializeDatabase = async () => {
  try {
    await testConnection();
    await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
    console.log('Database tables synchronized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = {
  sequelize,
  Session,
  Message,
  initializeDatabase,
};
