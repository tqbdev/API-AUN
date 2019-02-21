const express = require('express');
const router = express.Router();

const { isAuthenticated, canCUD } = require('../policies/Authenticated');

const {
  readAll,
  readOne,
  create,
  update,
  remove
} = require('../controllers/CriterionController');

router.get('/', isAuthenticated, readAll);
router.get('/:id', isAuthenticated, readOne);
router.post('/', isAuthenticated, canCUD, create);
router.patch('/:id', isAuthenticated, canCUD, update);
router.delete('/:id', isAuthenticated, canCUD, remove);

module.exports = router;
