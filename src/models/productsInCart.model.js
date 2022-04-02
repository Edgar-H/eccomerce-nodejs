const { DataTypes } = require('sequelize');
const { sequelize } = require('../util/database');

const ProductsInCart = sequelize.define('productsInCart', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(10),
    defaultValue: 'active', // pending, completed, cancelled
  },
});

module.exports = { ProductsInCart };
