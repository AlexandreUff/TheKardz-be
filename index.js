const express = require('express')
const server = express()

const gameRoutes = require('./routes/gameRoutes')

server.use('/game', gameRoutes)

server.listen(3001)