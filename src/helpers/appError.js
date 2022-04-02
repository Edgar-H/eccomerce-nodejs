class AppError extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.status = statusCode >= 500 ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };
