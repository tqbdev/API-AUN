const express = require('express');
const router = express.Router();

const { canCUD } = require('../policies/Authenticated');

const {
  readAll,
  readOne,
  create,
  update,
  remove
} = require('../controllers/NoteController');

router.get('/', readAll);
router.get('/:id', readOne);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
