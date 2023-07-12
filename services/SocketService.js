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

      socket.on("credential", async (credential) => {

        userCredentials = credential

        socket.join(userCredentials.hall)

        const response = await UserController.getAllUsersInSuchHall(userCredentials.hall)
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

      socket.on("reloadUsersInIntance", (users) => {
        console.log("Dados chegaram")
        users
      })

      socket.on("report", (report) => {
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

        if(!io.sockets.adapter.rooms.get(userCredentials.hall)?.size) console.log("LIMOU!")
        
      });
    });
}
