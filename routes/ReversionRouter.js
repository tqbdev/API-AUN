const express = require('express');
const router = express.Router();

const {
  readAll,
  readOne,
  create,
  release
} = require('../controllers/ReversionController');

router.get('/', readAll);
router.get('/:id', readOne);
router.post('/', create);
router.post('/release', release);

module.exports = router;
