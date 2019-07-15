const express = require('express');
const router = express.Router();

const { signup } = require('../policies/AuthenticationControllerPolicy');

const {
  readAll,
  readOne,
  create,
  update,
  remove
} = require('../controllers/UserController');

router.get('/', readAll);
router.get('/:id', readOne);
router.post('/', signup, create);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
