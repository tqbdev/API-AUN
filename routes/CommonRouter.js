const express = require('express');
const router = express.Router();

const {
  userSignIn,
  userToken,
  userRevokeToken
} = require('../controllers/AuthenticationController');

router.post('/signin', userSignIn);
router.post('/token', userToken);
router.delete('/token', userRevokeToken);

module.exports = router;
