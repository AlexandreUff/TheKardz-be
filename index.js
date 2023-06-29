const express = require('express')
const server = express()

const hallRoutes = require('./routes/hallRoutes')
const userRoutes = require('./routes/userRoutes')

//read body
server.use(
    express.urlencoded({
        extended: true
    })
);

server.use(express.json());

server.use('/hall', hallRoutes)
server.use('/user', userRoutes)

server.listen(3001)