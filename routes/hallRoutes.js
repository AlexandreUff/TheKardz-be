const express = require('express')
const router = express.Router()

const HallController = require('../controller/HallController')

router.post('/create', HallController.create)
router.get('/', HallController.findHall)

module.exports = router