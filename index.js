const express = require('express')
const server = express()
const SocketConnectionStart = require('./services/SocketService')
const cors = require('cors')
require('dotenv').config()

const hallRoutes = require('./routes/hallRoutes')
const userRoutes = require('./routes/userRoutes')
const gameRoutes = require('./routes/gameRoutes')

server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000' && `${process.env.URL_CLI_PROD}`);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

//read body
server.use(
    express.urlencoded({
        extended: true
    })
);

server.use(express.json());

server.use(cors())

server.use('/hall', hallRoutes)
server.use('/user', userRoutes)
server.use('/game', gameRoutes)

//Ver se esse serviço deve permanecer
server.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

server.listen(3001, () => {
    console.log(`Servidor iniciado na porta 3001.`);
    SocketConnectionStart();
  });