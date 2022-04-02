const express = require('express');

// Controller
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsById,
  getAllProducts
} = require('../controllers/products.controller');

const { validateSession } = require('../middlewares/auth.middleware');
const {
  productExists,
  productOwner
} = require('../middlewares/products.middleware');
const {
  createProductValidations,
  validateResult
} = require('../middlewares/validators.middleware');

const router = express.Router();

router.use(validateSession);

router
  .route('/')
  .get(getAllProducts)
  .post(createProductValidations, validateResult, createProduct);

router
  .use('/:id', productExists)
  .route('/:id')
  .get(getProductsById)
  .patch(productOwner, updateProduct)
  .delete(productOwner, deleteProduct);

module.exports = { productsRouter: router };
