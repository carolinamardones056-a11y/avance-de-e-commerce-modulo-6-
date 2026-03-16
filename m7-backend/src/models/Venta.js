const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Venta = sequelize.define('Venta', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'ventas',
  timestamps: false
});

module.exports = Venta;
