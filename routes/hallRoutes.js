const express = require('express')
const router = express.Router()

const HallController = require('../controller/HallController')

router.get('/', HallController.connect)

module.exports = router