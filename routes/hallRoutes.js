const express = require('express')
const router = express.Router()

const HallController = require('../controller/HallController')

router.get('/:userName', HallController.connect)

module.exports = router