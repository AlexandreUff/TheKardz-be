const express = require('express')
const router = express.Router()

const UserController = require('../controller/UserController')

router.get('/create', UserController.createInHall)

module.exports = router