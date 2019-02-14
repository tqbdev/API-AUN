const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../policies/Authenticated');

const {
  readAll,
  readOne,
  create,
  update,
  remove
} = require('../controllers/ImplicationController');

router.get('/', isAuthenticated, readAll);
router.get('/:id', isAuthenticated, readOne);
router.post('/', isAuthenticated, create);
router.patch('/:id', isAuthenticated, update);
router.delete('/:id', isAuthenticated, remove);

module.exports = router;
