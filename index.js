const express = require('express')
const server = express()

const hallRoutes = require('./routes/hallRoutes')
const userRoutes = require('./routes/userRoutes')

server.use('/hall', hallRoutes)
server.use('/user', userRoutes)

server.listen(3001)