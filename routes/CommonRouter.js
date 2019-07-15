const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../policies/Authenticated');

const {
  userSignIn,
  userToken,
  userRevokeToken,
  changePassword
} = require('../controllers/AuthenticationController');

const { uploadImage } = require('../controllers/ImageController');

router.post('/signin', userSignIn);
router.post('/token', userToken);
router.delete('/token', userRevokeToken);
router.post('/change-password', isAuthenticated, changePassword);
router.post('/upload-image', isAuthenticated, uploadImage);

module.exports = router;
