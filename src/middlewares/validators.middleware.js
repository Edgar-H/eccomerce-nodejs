const { body, validationResult } = require('express-validator');

const { AppError } = require('../helpers/appError');
const { catchAsync } = require('../helpers/catchAsync');

exports.createProductValidations = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Must provide a valid title'),
  body('description')
    .isString()
    .withMessage('Description must be a string')
    .notEmpty()
    .withMessage('Must provide a valid description'),
  body('quantity')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .custom((value) => value > 0)
    .withMessage('Quantity must be greater than 0'),
  body('price')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .custom((value) => value > 0)
    .withMessage('Quantity must be greater than 0')
];

exports.productInCartValidation = [
  body('productId')
    .isNumeric()
    .withMessage('Product id must be a number')
    .custom((value) => value > 0)
    .withMessage('Must provide a valid id'),
  body('quantity')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .custom((value) => value > 0)
    .withMessage('Quantity must be greater than 0')
];

exports.validateResult = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMsg = errors
      .array()
      .map(({ msg }) => msg)
      .join('. ');

    return next(new AppError(400, errorMsg));
  }

  next();
});
