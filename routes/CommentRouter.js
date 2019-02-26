const express = require('express');
const router = express.Router();

const { canCUD } = require('../policies/Authenticated');

const {
  readAll,
  readOne,
  create,
  update,
  remove
} = require('../controllers/CommentController');

router.get('/', readAll);
router.get('/:id', readOne);
router.post('/', canCUD, create);
router.patch('/:id', canCUD, update);
router.delete('/:id', canCUD, remove);

module.exports = router;
