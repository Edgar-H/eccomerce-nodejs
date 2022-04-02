// Models
const { User } = require('../models/user.model');

const { AppError } = require('../helpers/appError');
const { catchAsync } = require('../helpers/catchAsync');

exports.userExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({
    where: { status: 'active', id },
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    return next(new AppError(404, 'User not found'));
  }

  req.user = user;

  next();
});

exports.protectUserAccount = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { currentUser } = req;

  if (+id !== currentUser.id) {
    return next(
      new AppError(403, 'You are not authorized to perform this action')
    );
  }

  next();
});
