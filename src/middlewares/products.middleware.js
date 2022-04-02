// Models
const { Product } = require('../models/product.model');
const { User } = require('../models/user.model');

const { AppError } = require('../helpers/appError');
const { catchAsync } = require('../helpers/catchAsync');

exports.productExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { productId } = req.body;

  const product = await Product.findOne({
    where: { status: 'active', id: id || productId },
    include: [{ model: User, attributes: { exclude: ['password'] } }]
  });

  if (!product) {
    return next(new AppError(404, 'Product not found'));
  }

  req.product = product;

  next();
});

exports.productOwner = catchAsync(async (req, res, next) => {
  const { currentUser, product } = req;

  if (product.userId !== currentUser.id) {
    return next(
      new AppError(403, 'You are not authorized to perform this action')
    );
  }

  next();
});
