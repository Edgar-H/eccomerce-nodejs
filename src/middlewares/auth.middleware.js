const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { promisify } = require('util');

const { User } = require('../models/user.model');

const { AppError } = require('../helpers/appError');
const { catchAsync } = require('../helpers/catchAsync');

dotenv.config({ path: './config.env' });

exports.validateSession = catchAsync(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    return next(new AppError(401, 'No token provided'));
  }
  // extract token from Bearer token
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return next(new AppError(401, 'No token provided'));
  }
  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user still exists
  const user = await User.findOne({
    where: { id: decoded.id },
    attributes: { exclude: ['password'] }
  });
  if (!user) {
    return next(new AppError(401, 'Invalid token'));
  }

  // check status of user
  switch (user.status) {
    case 'active':
      req.currentUser = user;
      return next();
    case 'inactive':
      return next(new AppError(400, 'user-inactive'));
    case 'blocked':
      return next(new AppError(401, 'User-blocked'));
    case 'deleted':
      return next(new AppError(401, 'User-deleted'));
    default:
      return next(new AppError(401, 'Something went wrong'));
  }
});
