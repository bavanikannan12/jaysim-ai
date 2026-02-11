const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sessionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  scenarioId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  scenarioTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  scenarioDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  scenarioData: {
    type: DataTypes.TEXT, // Store full scenario as JSON string
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('scenarioData');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('scenarioData', JSON.stringify(value));
    },
  },
  sessionLength: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 15,
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'abandoned'),
    defaultValue: 'active',
  },
  feedback: {
    type: DataTypes.TEXT, // Store feedback as JSON string
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('feedback');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('feedback', value ? JSON.stringify(value) : null);
    },
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'sessions',
  timestamps: true,
});

module.exports = Session;
