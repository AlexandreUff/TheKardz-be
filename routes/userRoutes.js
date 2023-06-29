const express = require('express')
const router = express.Router()

const UserController = require('../controller/UserController')

router.get('/:name/:hall', UserController.createInHall)

module.exports = router