const express = require('express');
const socketIO = require('socket.io');
const UserController = require('../controller/UserController');

const app = express();


module.exports = function SocketConnectionStart(){
  const server = app.listen(3002);

  const io = socketIO(server);

  
  io.on('connection', (socket) => {
      let userCredentials;
      console.log('Um cliente se conectou.');
    
      // Adicione aqui o código para lidar com os eventos de socket.io

      socket.on("credential", async (credential) => {

        userCredentials = credential

        socket.join(userCredentials.hall)

        const response = await UserController.getAllUsersInSuchHall(userCredentials.hall)
        /* socket.emit("getUsers",response) */
        io.to(userCredentials.hall).emit("getUsers", response);
      })

      socket.on("report", (report) => {
        console.log("Cred",userCredentials, report.author)
        /* io.to(userCredential).emit("report", report); */
        socket.broadcast.to(userCredentials.hall).emit("report", report);
      })
    
      socket.on('disconnect', () => {
        console.log('Um cliente se desconectou.');
      });
    });
}
