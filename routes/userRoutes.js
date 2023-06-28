const express = require('express')
const router = express.Router()

const UserController = require('../controller/UserController')

router.get('/:name/:id', UserController.create)

module.exports = router