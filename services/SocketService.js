const express = require('express');
const socketIO = require('socket.io');
const UserController = require('../controller/UserController');
const ReportModel = require('../Utils/ReportModel');
const CardModel = require('../Utils/CardModel');

const app = express();


module.exports = function SocketConnectionStart(){
  const server = app.listen(3002);

  const io = socketIO(server);

  
  io.on('connection', (socket) => {
      let userCredentials;

      let usersInThisHall;

      let userCards = [
        new CardModel("attack",1,1),
        new CardModel("defense",Infinity,1),
        new CardModel("recharging",Infinity,1),
      ];

      let lastMovementUsed

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
        }

        io.to(userCredentials.hall).emit("getUsers", usersInThisHall);
      })

      socket.on("get-fighter-cards",()=>{
        console.log("CARDS DO USUÁRIO", userCards)

        //O servidor só envia as cartas com quantidade (amount) maior que zero
        const cardsWithAmountBiggerThanZero = userCards.filter(card => {
          if(card.amount > 0){
            return card
          }
        })

        io.to(userCredentials.hall).emit("get-fighter-cards", {
          userCredentials,
          userCards: cardsWithAmountBiggerThanZero
        });
      })

      socket.on("report", (report) => {
        socket.broadcast.to(userCredentials.hall).emit("report", report);
      })

      socket.on("starting-round", async () => {
        /* VER SE O BROADCAST TALVEZ NÃO SEJA MAIS INTERESSANTE PRA EVITAR DUPLICAÇÃO*/
        const thisPlayerById = await UserController.findUserById(userCredentials.userId)

        if(thisPlayerById.data.lineNumber === 0){
          io.to(userCredentials.hall).emit("fight-status","start-round")
        }
      })

      socket.on("chosen-movement", (movimentData) => {
        const movementFromClient = {...movimentData.movement}
        const userCardIndex = userCards.findIndex(card => card.cardName === movementFromClient.cardName && 
          card.type === movementFromClient.type)

        userCards[userCardIndex].amount--

        console.log("Movimento que chegou", movimentData)
        socket.broadcast.to(userCredentials.hall).emit("chosen-movement",movimentData)
        /* io.to(userCredentials.hall).emit("fight-status","comparing-movements") */
      })

      socket.on("user-save-data", async (userData) => {
        await UserController.updateUser(userData)
      })

      socket.on("start-new-fight", async (data)=>{
        const response = await UserController.getAllUsersInSuchHall(userCredentials.hall)
        const usersWithOldDatas = [...response.data];

        const usersWithNewDatas = usersWithOldDatas.map(user => {
          if(user._id.toString() === data.winner._id){
            user.lineNumber = 0
            user.victories++
          } else if(user._id.toString() === data.loser._id){
            user.lineNumber = usersWithOldDatas.length-1
            user.loses++
          } else {
            user.lineNumber--
          }

          return user
        })

        console.log("NOVOS DADOS:",usersWithNewDatas)

        usersWithNewDatas.forEach(async (user) => {
          await UserController.updateUser(user)
        });

        //As cartas do usuário voltam à configuração inicial
        userCards = [
          new CardModel("attack",1,1),
          new CardModel("defense",Infinity,1),
          new CardModel("recharging",Infinity,1),
        ];

        io.to(userCredentials.hall).emit("getUsers", usersWithNewDatas);
        io.to(userCredentials.hall).emit("fight-status","start-fight")
      })
    
      socket.on('disconnect', async () => {
        console.log('Um cliente se desconectou.');
        console.log("Credenciais de saída:",userCredentials)
        const thisPlayerById = await UserController.findUserById(userCredentials.userId)

        await UserController.deleteUserById(userCredentials.userId)

        //Caso seja um player que estava jogando no momento
        const isAPlayerFighting = thisPlayerById.data.lineNumber === 0 || thisPlayerById.data.lineNumber === 1

        if(isAPlayerFighting){
          socket.broadcast.to(userCredentials.hall).emit("fight-status","end-fight")
        }

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

        const isThereMoreThanOne = io.sockets.adapter.rooms.get(userCredentials.hall)?.size > 1

        //Se era um player que estava jogando e se há mais de um jogador na sala, dá o start na próxima luta
        if(isAPlayerFighting && isThereMoreThanOne){
          console.log("Foi")
          io.to(userCredentials.hall).emit("fight-status","start-fight")
        }

        if(!io.sockets.adapter.rooms.get(userCredentials.hall)?.size) console.log("LIMOU!")
        
      });
    });
}
