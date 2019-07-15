const express = require('express');
const router = express.Router();

const { readAll } = require('../controllers/EvidenceRefController');

router.get('/', readAll);

module.exports = router;
