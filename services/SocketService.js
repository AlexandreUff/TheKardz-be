const express = require('express');
const socketIO = require('socket.io');
const UserController = require('../controller/UserController');

const app = express();


module.exports = function SocketConnectionStart(){
  const server = app.listen(3002);

  const io = socketIO(server);

    io.on('connection', (socket) => {
      console.log('Um cliente se conectou.');
    
      // Adicione aqui o código para lidar com os eventos de socket.io

      socket.on("credential", async (credential) => {
        const response = await UserController.getAllUsersInSuchHall(credential.hall)
        socket.emit("getUsers",response)
      })

      socket.on("attack", (msg) => {
        console.log(msg)

        setTimeout(()=>{
          socket.emit("send",{msg: "Olá!"})
        }, 5000)
      })
    
      socket.on('disconnect', () => {
        console.log('Um cliente se desconectou.');
      });
    });
}
