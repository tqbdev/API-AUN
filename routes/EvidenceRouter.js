const express = require('express');
const router = express.Router();

const {
  readAll,
  readOne,
  create,
  update,
  remove,
  clone
} = require('../controllers/EvidenceController');

router.get('/', readAll);
router.get('/:id', readOne);
router.post('/', create);
router.post('/:id', clone);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
