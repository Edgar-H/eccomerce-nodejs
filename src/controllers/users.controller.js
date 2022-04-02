const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const { User } = require('../models/user.model');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');
const { Cart } = require('../models/cart.model');

const { filterObj } = require('../helpers/filterObj');
const { AppError } = require('../helpers/appError');
const { catchAsync } = require('../helpers/catchAsync');

dotenv.config({ path: './config.env' });

exports.loginUser = catchAsync(async (req, res, next) => {
  const { userLogin, password } = req.body;

  if (!userLogin && userLogin === 0) {
    return next(new AppError(400, 'Email or username is required'));
  }
  if (!password) {
    return next(new AppError(400, 'Password is required'));
  }

  const validateStatus = (status) => {
    switch (status) {
      case 'active':
        return true;
      case 'inactive':
        return next(new AppError(400, 'user-inactive'));
      case 'blocked':
        return next(new AppError(400, 'user-blocked'));
      case 'deleted':
        return next(new AppError(400, 'user-deleted'));
      default:
        return next(new AppError(400, 'Something went wrong'));
    }
  };

  let user;
  if (userLogin.includes('@')) {
    user = await User.findOne({ where: { email: userLogin } });
    if (!user) {
      return next(new AppError(404, 'email-invalid'));
    } else if (!validateStatus(user.status)) {
      return next();
    }
  } else {
    user = await User.findOne({ where: { username: userLogin } });
    if (!user) {
      return next(new AppError(404, 'username-invalid'));
    } else if (!validateStatus(user.status)) {
      return next();
    }
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError(401, 'Password is incorrect'));
  }

  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.status(200).json({
    status: 'success',
    data: { token }
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({
    where: { status: 'active' },
    attributes: { exclude: ['password'] }
  });

  res.status(200).json({
    status: 'success',
    data: users
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      data: newUser
    });
  } catch (err) {
    switch (err.errors[0].path) {
      case 'email':
        return next(new AppError(400, 'Email already exists'));
      case 'username':
        return next(new AppError(400, 'Username already exists'));
      default:
        return next(new AppError(400, 'Something went wrong'));
    }
  }
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  const attributes = ['username', 'email'];
  const data = filterObj(req.body, attributes);

  await user.update({ ...data });
  res.status(201).json({ status: 'success', message: 'User updated' });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  await user.update({ status: 'deleted' });
  res.status(201).json({ status: 'success', message: 'User deleted' });
});

exports.getProductosByUserId = catchAsync(async (req, res, next) => {
  const { id } = req.currentUser;

  const products = await Product.findAll({
    where: { userId: id }
  });

  res.status(200).json({
    status: 'success',
    data: { products }
  });
});

exports.getAllOrdersByUserId = catchAsync(async (req, res, next) => {
  const { currentUser } = req;

  const orders = await Order.findAll({ where: { userId: currentUser.id } });

  res.status(200).json({
    status: 'success',
    data: { orders }
  });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findOne({
    where: { id },
    include: [
      {
        model: Cart,
        include: [
          { model: Product, through: { where: { status: 'purchased' } } }
        ]
      }
    ]
  });

  if (!order) {
    return next(new AppError(404, 'Order not found'));
  }

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});
