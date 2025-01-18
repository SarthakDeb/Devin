const express = require('express');
const {getResult} = require('../controllers/ai.controller')

const router = express.Router();

router.get('/get-result', getResult);

module.exports = router;