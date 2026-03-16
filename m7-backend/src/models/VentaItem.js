const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');
const Venta = require('./Venta');
const Producto = require('./Producto');

const VentaItem = sequelize.define('VentaItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  venta_id: {
    type: DataTypes.UUID,
    references: {
      model: Venta,
      key: 'id'
    }
  },
  producto_id: {
    type: DataTypes.UUID,
    references: {
      model: Producto,
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'detalle_ventas',
  timestamps: false
});

Venta.hasMany(VentaItem, { foreignKey: 'venta_id' });
VentaItem.belongsTo(Venta, { foreignKey: 'venta_id' });
VentaItem.belongsTo(Producto, { foreignKey: 'producto_id' });

module.exports = VentaItem;
