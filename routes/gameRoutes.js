const express = require('express')
const router = express.Router()

const GameController = require('../controller/GameController')

router.get('/', GameController.gameConnection)

module.exports = router