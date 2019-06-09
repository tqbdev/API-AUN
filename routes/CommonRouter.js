const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../policies/Authenticated');

const {
  userSignIn,
  userToken,
  userRevokeToken,
  changePassword
} = require('../controllers/AuthenticationController');

router.post('/signin', userSignIn);
router.post('/token', userToken);
router.delete('/token', userRevokeToken);
router.post('/change-password', isAuthenticated, changePassword);

module.exports = router;
