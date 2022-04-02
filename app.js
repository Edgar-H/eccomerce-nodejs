const express = require('express');
const cors = require('cors');

const { globalErrorHandler } = require('./src/controllers/error.controller');

// Routers
const { usersRouter } = require('./src/routes/users.routes');
const { productsRouter } = require('./src/routes/products.routes');
const { cartRouter } = require('./src/routes/cart.routes');

const { AppError } = require('./src/helpers/appError');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Endpoints
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/cart', cartRouter);

app.use('*', (req, res, next) => {
  next(new AppError(404, `${req.originalUrl} not found in this server.`));
});

// Error handler (err -> AppError)
app.use(globalErrorHandler);

module.exports = { app };
