const express = require('express');
const socketIO = require('socket.io');

const app = express();


module.exports = function SocketConnectionStart(){
  console.log("Bateu aqui.")
  const server = app.listen(3002);

  const io = socketIO(server);

    io.on('connection', (socket) => {
      console.log('Um cliente se conectou.');
    
      // Adicione aqui o código para lidar com os eventos de socket.io
    
      socket.on('disconnect', () => {
        console.log('Um cliente se desconectou.');
      });
    });
}
