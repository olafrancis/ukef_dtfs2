const { validationResult } = require('express-validator');

/**
 * Validation middleware, used on a per route basis to handle result of validations that are run on the inputs of an API route.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {(input?: unknown) => void} next Callback function name
 */
const handleValidationResult = (req, res, next) => {
  const validationResults = validationResult(req);
  if (!validationResults.isEmpty()) {
    return res.status(400).json({ status: 400, errors: validationResults.array() });
  }
  return next();
};

module.exports = handleValidationResult;
