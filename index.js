const express = require('express')
const server = express()

const gameRoutes = require('./routes/gameRoutes')
const userRoutes = require('./routes/userRoutes')

server.use('/game', gameRoutes)
server.use('/user', userRoutes)

server.listen(3001)