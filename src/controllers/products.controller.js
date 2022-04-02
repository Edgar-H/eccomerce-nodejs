const { User } = require('../models/user.model');
const { Product } = require('../models/product.model');

const { filterObj } = require('../helpers/filterObj');
const { catchAsync } = require('../helpers/catchAsync');

exports.createProduct = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { status: 'active' },
    include: [{ model: User, attributes: { exclude: ['password'] } }]
  });

  res.status(200).json({
    status: 'success',
    data: { products }
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { product } = req;

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

exports.getProductsById = catchAsync(async (req, res, next) => {
  const { title, description, quantity, price } = req.body;
  const { id } = req.currentUser;

  const newProduct = await Product.create({
    title,
    description,
    quantity,
    price,
    userId: id
  });

  res.status(201).json({
    status: 'success',
    data: { newProduct }
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { product } = req;

  const attributes = ['title', 'description', 'quantity', 'price'];
  const data = filterObj(req.body, attributes);

  await product.update({ ...data });

  res.status(204).json({ status: 'success' });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { product } = req;

  await product.update({ status: 'deleted' });

  res.status(204).json({ status: 'success' });
});
