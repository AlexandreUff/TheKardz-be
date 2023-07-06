const express = require('express')
const router = express.Router()

const UserController = require('../controller/UserController')

router.post('/create', UserController.createInHall)

module.exports = router