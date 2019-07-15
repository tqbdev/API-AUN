const express = require('express');
const router = express.Router();

const {
  readAll,
  readOne,
  create,
  update,
  remove,
  extract
} = require('../controllers/NoteController');

router.get('/', readAll);
router.get('/:id', readOne);
router.post('/', create);
router.post('/extract', extract);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
