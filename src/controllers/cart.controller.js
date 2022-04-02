const { Product } = require('../models/product.model');
const { Cart } = require('../models/cart.model');
const { ProductsInCart } = require('../models/productsInCart.model');
const { Order } = require('../models/order.model');

const { AppError } = require('../helpers/appError');
const { catchAsync } = require('../helpers/catchAsync');

exports.getUserCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;

  const cart = await Cart.findOne({
    where: { status: 'active', userId: currentUser.id },
    include: [
      {
        model: Product,
        through: { where: { status: 'active' } }
      }
    ]
  });

  if (!cart) {
    return next(new AppError(404, 'This user does not have a cart yet'));
  }

  res.status(200).json({ status: 'success', data: { cart } });
});

exports.addProductToCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;
  const { productId, quantity } = req.body;

  const product = await Product.findOne({
    where: { status: 'active', id: productId }
  });

  if (quantity > product.quantity) {
    return next(
      new AppError(400, `This product only has ${product.quantity} items.`)
    );
  }

  const cart = await Cart.findOne({
    where: { status: 'active', userId: currentUser.id }
  });

  if (!cart) {
    const newCart = await Cart.create({ userId: currentUser.id });
    await ProductsInCart.create({
      productId,
      cartId: newCart.id,
      quantity
    });
  } else {
    const productExists = await ProductsInCart.findOne({
      where: { cartId: cart.id, productId }
    });

    if (productExists && productExists.status === 'active') {
      return next(new AppError(400, 'This product is already in the cart'));
    }

    if (productExists && productExists.status === 'removed') {
      await productExists.update({ status: 'active', quantity });
    }

    if (!productExists) {
      await ProductsInCart.create({ cartId: cart.id, productId, quantity });
    }
  }

  res.status(201).json({ status: 'success' });
});

exports.updateCartProduct = catchAsync(async (req, res, next) => {
  const { cart, product } = req;
  const { productId, quantity } = req.body;

  if (quantity > product.quantity) {
    return next(
      new AppError(400, `This product only has ${product.quantity} items`)
    );
  }

  const ProductsInCart = await ProductsInCart.findOne({
    where: { status: 'active', cartId: cart.id, productId }
  });

  if (!ProductsInCart) {
    return next(
      new AppError(404, `Can't update product, is not in the cart yet`)
    );
  }

  if (quantity === 0) {
    await ProductsInCart.update({ quantity: 0, status: 'removed' });
  }

  if (quantity > 0) {
    await ProductsInCart.update({ quantity });
  }

  res.status(204).json({ status: 'success' });
});

exports.removeProductFromCart = catchAsync(async (req, res, next) => {
  const { cart } = req;
  const { productId } = req.params;

  const ProductsInCart = await ProductsInCart.findOne({
    where: { status: 'active', cartId: cart.id, productId }
  });

  if (!ProductsInCart) {
    return next(new AppError(404, 'This product does not exist in this cart'));
  }

  await ProductsInCart.update({ status: 'removed', quantity: 0 });

  res.status(204).json({ status: 'success' });
});

exports.purchaseCart = catchAsync(async (req, res, next) => {
  const { currentUser, cart } = req;

  let totalPrice = 0;

  const cartPromises = cart.products.map(async (product) => {
    await product.ProductsInCart.update({ status: 'purchased' });

    const productPrice = product.price * product.ProductsInCart.quantity;

    totalPrice += productPrice;

    const newQty = product.quantity - product.ProductsInCart.quantity;

    return await product.update({ quantity: newQty });
  });

  await Promise.all(cartPromises);

  await cart.update({ status: 'purchased' });

  const newOrder = await Order.create({
    userId: currentUser.id,
    cartId: cart.id,
    issuedAt: new Date().toLocaleString(),
    totalPrice
  });

  res.status(201).json({
    status: 'success',
    data: { newOrder }
  });
});
