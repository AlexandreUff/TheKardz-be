const express = require('express');
const socketIO = require('socket.io');
const UserController = require('../controller/UserController');
const ReportModel = require('../Utils/ReportModel')

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
        socket.broadcast.to(userCredentials.hall).emit(
          "report",
          new ReportModel(
            "game_server",
            "log",
            `${userCredentials.userName} entrou.`,
            false,
            new Date()
          )
          );
        io.to(userCredentials.hall).emit("getUsers", response);
      })

      socket.on("report", (report) => {
        /* io.to(userCredential).emit("report", report); */
        socket.broadcast.to(userCredentials.hall).emit("report", report);
      })
    
      socket.on('disconnect', async () => {
        console.log('Um cliente se desconectou.');
        await UserController.deleteUserById(userCredentials.userId)
        socket.broadcast.to(userCredentials.hall).emit(
          "report",
          new ReportModel(
            "game_server",
            "log",
            `${userCredentials.userName} se desconectou.`,
            false,
            new Date()
          )
          );
        
        const response = await UserController.getAllUsersInSuchHall(userCredentials.hall)
        io.to(userCredentials.hall).emit("getUsers", response);
        socket.leave(userCredentials.hall)

        /* console.log("NUMERO:",!!io.sockets.adapter.rooms.get(userCredentials.hall)?.size === true) */
        if(!io.sockets.adapter.rooms.get(userCredentials.hall)?.size) console.log("LIMOU!")
        
      });
    });
}
