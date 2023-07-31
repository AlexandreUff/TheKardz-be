const express = require('express')
const router = express.Router()

const UserController = require('../controller/UserController')

router.post('/create', UserController.createInHall)
router.post('/update', UserController.updateUser)

module.exports = router