const express = require('express');
const router = express.Router();

// const { isAuthenticated } = require('../policies/Authenticated');

const AuthenticationControllerPolicy = require('../policies/AuthenticationControllerPolicy');

const {
  userSignIn,
  userSignUp,
  userToken,
  userRevokeToken
} = require('../controllers/AuthenticationController');

// Authentication route
router.post('/signup', AuthenticationControllerPolicy.signup, userSignUp);
router.post('/signin', userSignIn);
router.post('/token', userToken);
router.delete('/token', userRevokeToken);

module.exports = router;
