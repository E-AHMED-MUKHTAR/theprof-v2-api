
const { constants } = require('../constants');

const errorHand = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.status(statusCode).json({
        title: "VALIDATION ERROR",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.UNAUTHORIZED:
      res.status(statusCode).json({
        title: "UNAUTHORIZED",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.NOT_FOUND:
      res.status(statusCode).json({
        title: "NOT FOUND",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.FORBIDEN:
      res.status(statusCode).json({
        title: "FORBIDDEN",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.SERVER_ERROR:
      res.status(statusCode).json({
        title: "SERVER ERROR",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    default:
      res.status(500).json({
        title: "UNKNOWN ERROR",
        message: err.message,
        stackTrace: err.stack,
      });
      break;
  }
};

module.exports = errorHand;
