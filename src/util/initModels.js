// Models
const { Cart } = require('../models/cart.model');
const { Order } = require('../models/order.model');
const { Product } = require('../models/product.model');
const { ProductsInCart } = require('../models/productsInCart.model');
const { User } = require('../models/user.model');

const initModels = () => {
  // 1 User <--> M Product
  User.hasMany(Product);
  Product.belongsTo(User);

  // 1 User <--> M Order
  User.hasMany(Order);
  Order.belongsTo(User);

  // 1 User <--> 1 Cart
  User.hasOne(Cart);
  Cart.belongsTo(User);

  // M Cart <--> M Product
  Cart.belongsToMany(Product, { through: ProductsInCart });
  Product.belongsToMany(Cart, { through: ProductsInCart });

  // 1 Order <--> 1 Cart
  Cart.hasOne(Order);
  Order.belongsTo(Cart);
};

module.exports = { initModels };
