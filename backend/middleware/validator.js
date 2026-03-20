const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().trim(),
  body('location').optional().trim(),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const cropValidation = [
  body('name').trim().notEmpty().withMessage('Crop name is required'),
  body('category').optional().trim(),
];

const marketValidation = [
  body('name').trim().notEmpty().withMessage('Market name is required'),
  body('region').trim().notEmpty().withMessage('Region is required'),
];

const priceValidation = [
  body('crop_id').isInt({ min: 1 }).withMessage('Valid crop ID is required'),
  body('market_id').isInt({ min: 1 }).withMessage('Valid market ID is required'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  cropValidation,
  marketValidation,
  priceValidation,
};
