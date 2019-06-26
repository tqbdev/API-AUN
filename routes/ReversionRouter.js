const express = require('express');
const router = express.Router();

const {
  readAll,
  readOne,
  create,
  release,
  extract
} = require('../controllers/ReversionController');

router.get('/', readAll);
router.get('/:id', readOne);
router.post('/', create);
router.post('/release', release);
router.post('/extract', extract);

module.exports = router;
