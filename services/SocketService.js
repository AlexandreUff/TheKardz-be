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

      let usersInThisHall;

      console.log('Um cliente se conectou.');

      socket.on("credential", async (credential) => {

        userCredentials = credential

        console.log("Credenciais de entrada:",userCredentials)

        socket.join(userCredentials.hall)

        const response = await UserController.getAllUsersInSuchHall(userCredentials.hall)

        usersInThisHall = [...response.data];

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
        /* io.to(userCredentials.hall).emit("getUsers", response); */

        if(io.sockets.adapter.rooms.get(userCredentials.hall).size === 2){
          /* console.log(usersInThisHall) */
          /* const thereIsAFight = usersInThisHall.find(index => index.isFighting === true) */
          /* console.log(thereIsAFight) */

          /* if(!thereIsAFight){ */
            /* usersInThisHall[0].isFighting = true
            usersInThisHall[1].isFighting = true */

            /* await UserController.updateUser(usersInThisHall[0])
            await UserController.updateUser(usersInThisHall[1]) */

            console.log("Inicia ciclo de partida!")
            io.to(userCredentials.hall).emit(
            "report",
            new ReportModel(
              "game_server",
              "log",
              `${userCredentials.userName} vs ${usersInThisHall[0].name}.`,
              false,
              new Date()
            )
            );

            io.to(userCredentials.hall).emit("fight-status","start-fight")

          /* } else {
            console.log("Apenas aguarda chegar sua vez")
          } */
        }

        io.to(userCredentials.hall).emit("getUsers", usersInThisHall);
      })

      socket.on("report", (report) => {
        socket.broadcast.to(userCredentials.hall).emit("report", report);
      })

      socket.on("starting-round", async () => {
        /* VER SE O BROADCAST TALVEZ NÃO SEJA MAIS INTERESSANTE PRA EVITAR DUPLICAÇÃO*/
        const thisPlayerById = await UserController.findUserById(userCredentials.userId)

        if(thisPlayerById.data.lineNumber === 0){
          console.log(`${thisPlayerById.data.name} de idx ${thisPlayerById.data.lineNumber} na fila iniciou a luta.`)
          io.to(userCredentials.hall).emit("fight-status","start-round")
        }
      })
    
      socket.on('disconnect', async () => {
        console.log('Um cliente se desconectou.');
        console.log("Credenciais de saída:",userCredentials)
        const thisPlayerById = await UserController.findUserById(userCredentials.userId)

        await UserController.deleteUserById(userCredentials.userId)

        const allUsers = await UserController.getAllUsersInSuchHall(userCredentials.hall)

        const usersWithNewLineNumber = allUsers.data.map(user => {
          if(user.lineNumber > thisPlayerById.data.lineNumber){
            user.lineNumber--
            return user
          } else {
            return user
          }
        })

        /* Mande usersWithNewLineNumber a todos, mas só salve no banco os modificados*/
        usersWithNewLineNumber.forEach(async (user) => {
          if(user.lineNumber >= thisPlayerById.data.lineNumber){
            await UserController.updateUser(user)
          }
        });

        io.to(userCredentials.hall).emit("fight-status","end-fight")

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
        
        io.to(userCredentials.hall).emit("getUsers", usersWithNewLineNumber);
        socket.leave(userCredentials.hall)

        //Caso seja um player que esteja jogando
        const isAPlayerFighting = thisPlayerById.data.lineNumber === 0 || thisPlayerById.data.lineNumber === 1
        const isThereMoreThanOne = io.sockets.adapter.rooms.get(userCredentials.hall)?.size > 1

        if(isAPlayerFighting && isThereMoreThanOne){
          console.log("Foi")
          io.to(userCredentials.hall).emit("fight-status","start-fight")
        }

        if(!io.sockets.adapter.rooms.get(userCredentials.hall)?.size) console.log("LIMOU!")
        
      });
    });
}
