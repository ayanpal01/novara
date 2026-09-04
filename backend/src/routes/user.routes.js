const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { 
  getAddresses,
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress 
} = require('../controllers/user.controller');
const { protect, syncUser } = require('../middleware/auth.middleware');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

const addressValidationRules = [
  body('name').trim().notEmpty().withMessage('Full Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').trim().notEmpty().withMessage('Mobile number is required')
    .matches(/^(?:\+91|91)?[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian mobile number'),
  body('alternatePhone').optional({ checkFalsy: true }).trim()
    .matches(/^(?:\+91|91)?[6-9]\d{9}$/).withMessage('Alternate phone must be a valid 10-digit Indian mobile number'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pincode').trim().notEmpty().withMessage('Pincode is required')
    .matches(/^\d{6}$/).withMessage('Please enter a valid 6-digit pincode'),
  body('country').optional().isString().trim(),
  body('latitude').optional().isNumeric(),
  body('longitude').optional().isNumeric(),
  body('isDefault').optional().isBoolean(),
  body('label').optional().isIn(['Home', 'Work', 'Other']).withMessage('Invalid address label')
];

router.route('/addresses')
  .get(protect, syncUser, getAddresses)
  .post(protect, syncUser, addressValidationRules, validate, addAddress);

router.route('/addresses/:id')
  .put(protect, syncUser, addressValidationRules, validate, updateAddress)
  .delete(protect, syncUser, deleteAddress);

router.route('/addresses/:id/default')
  .patch(protect, syncUser, setDefaultAddress);

module.exports = router;
