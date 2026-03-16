const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  precio: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  img: {
    type: DataTypes.STRING
  },
  url: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'productos',
  timestamps: false
});

module.exports = Producto;
