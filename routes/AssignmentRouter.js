const express = require('express');
const router = express.Router();

const {
  readAll,
  readOne,
  create,
  remove
} = require('../controllers/AssignmentController');

router.get('/', readAll);
router.get('/:id', readOne);
router.post('/', create);
router.delete('/:id', remove);

module.exports = router;
