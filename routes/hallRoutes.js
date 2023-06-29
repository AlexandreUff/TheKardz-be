const express = require('express')
const router = express.Router()

const HallController = require('../controller/HallController')

router.post('/:userName', HallController.create)

module.exports = router