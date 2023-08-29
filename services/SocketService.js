const express = require('express');
const app = express();
const http = require("http").createServer(app)
const { Server } = require('socket.io');
const UserController = require('../controller/UserController');
const ReportModel = require('../Utils/ReportModel');
const CardModel = require('../Utils/CardModel');
const HallController = require('../controller/HallController');



module.exports = function SocketConnectionStart(){
  /* const server = http.listen(3002); */ //Antes era app.listen(3002);
  /* console.log("server",server) */

  /* socketIO(http, {
    cors: {
      origin: "*"
    }
  }) */

  const io = new Server(http, {
    path:"/tkc/",
    transports: ['websocket'],
    cors: {
      origin: "*"
    }
  });

  io.listen(3002)

  
  io.on('connection', (socket) => {
      let userCredentials;

      let usersInThisHall;
      
      let lastMovementUsed = {
        name: "",
        amount: 0
      }
      
      let userCards

      function setUserCardsAsDefault(){
        //Usuário não obtém cartas de tipo 2 e 3 como padrão inicial
        userCards = [
          new CardModel("attack",0,3),
          new CardModel("attack",0,2),
          new CardModel("attack",1,1),
          new CardModel("defense",0,3),
          new CardModel("defense",0,2),
          new CardModel("defense",Infinity,1),
          new CardModel("recharging",0,3),
          new CardModel("recharging",0,2),
          new CardModel("recharging",Infinity,1),
        ];

        lastMovementUsed = {
          name: "",
          amount: 0
        };
      }

      setUserCardsAsDefault()

      console.log('Um cliente se conectou.');

      socket.on("credential", async (credential) => {

        userCredentials = credential

        console.log("Credenciais de entrada:",userCredentials)

        const response = await UserController.getAllUsersInSuchHall(userCredentials.hall)
        
        usersInThisHall = [...response.data];
        
        if(!usersInThisHall.find(user => user._id.toString() === userCredentials.userId)){
          console.log("USUÁRIO INEXISTENTE")
          socket.emit("redirect-nonexistent-user")
        } else {
          console.log("EXISTE!")

          socket.join(userCredentials.hall)

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
        }
      })

      socket.on("get-fighter-cards",()=>{
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

      function userCardsDecrease(cardChosen){
        const userCardIndex = userCards.findIndex(card => card.cardName === cardChosen.cardName && 
          card.type === cardChosen.type)

        userCards[userCardIndex].amount--
      }

      //Handler de cartas bonus
      function userCardsBonusHandler(cardChosen){
        //Caso a carta jogada na partida anterior é igual a jogada agora
        if(lastMovementUsed.name === cardChosen.cardName){

          //Caso tenha usado 1x
          if(lastMovementUsed.amount === 1){
            const cardToIncrementAmount = userCards.findIndex(card => card.cardName === lastMovementUsed.name &&
              card.type === 2)

              //O usuário só pode ter uma carta bônus de cada tipo
              if(userCards[cardToIncrementAmount].amount === 0) userCards[cardToIncrementAmount].amount++
          }

          //Caso tenha usado 2x
          if(lastMovementUsed.amount >= 2){
            const cardToIncrementAmount = userCards.findIndex(card => card.cardName === lastMovementUsed.name &&
              card.type === 3)

              //O usuário só pode ter uma carta bônus de cada tipo
              if(userCards[cardToIncrementAmount].amount === 0) userCards[cardToIncrementAmount].amount++
          }

          //Incrementa o número de vezes que a carta foi usada
          lastMovementUsed.amount++
        } else {
          //Se a carta da partida anterior for diferente, ele atribui e põe o total de uso igual a 1
          lastMovementUsed.name = cardChosen.cardName
          lastMovementUsed.amount = 1
        }
      }

      //Caso o usuário use algum tipo de card de recarga
      function rechargingHandler(cardChosen){
        if(cardChosen.cardName === "recharging"){
          switch (cardChosen.type){
            //Caso seja recharging tipo 1, ele carrega uma carta de ataque
            case 1: 
              userCards[2].amount++;
              break;
            //Caso seja recharging tipo 2, ele carrega duas cartas de ataque
            case 2: 
              userCards[2].amount = userCards[2].amount + 2;
              break;
            //Caso seja recharging tipo 3, ele carrega três cartas de ataque
            case 3: 
              userCards[2].amount = userCards[2].amount + 3;
              break;
          }

          //Obs: O índice 2 é o índice de carta de ataque do tipo 1
        }
      }

      socket.on("chosen-movement", (movimentData) => {
        const movementFromClient = {...movimentData.movement}
        /* const userCardIndex = userCards.findIndex(card => card.cardName === movementFromClient.cardName && 
          card.type === movementFromClient.type)

        userCards[userCardIndex].amount-- */

        userCardsDecrease(movementFromClient)

        userCardsBonusHandler(movementFromClient)

        rechargingHandler(movementFromClient)

        socket.broadcast.to(userCredentials.hall).emit("chosen-movement",movimentData)
        /* io.to(userCredentials.hall).emit("fight-status","comparing-movements") */
      })

      socket.on("user-save-data", async (userData) => {
        await UserController.updateUser(userData)
      })

      //As cartas do usuário e seu último movimento usado voltam à configuração inicial
      socket.on("reset-my-cards", ()=>{
        console.log("Reiniciei", userCredentials.userName)

        lastMovementUsed = {
          name: "",
          amount: 0
        }

        setUserCardsAsDefault()
      })

      socket.on("start-new-fight", async (data)=>{
        io.to(userCredentials.hall).emit(
          "report",
          new ReportModel(
            "game_server",
            "log",
            `${data.winner.name} venceu ${data.loser.name}.`,
            false,
            new Date()
          )
          );

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

        usersWithNewDatas.forEach(async (user) => {
          await UserController.updateUser(user)
        });

        //Captura o próximo a jogar
        const nextFighter = usersWithNewDatas.find(user => {
          return user.lineNumber === 1
        })

        //Captura o primeiro que está na fila de espera
        const firstOfThoseWhoWait = usersWithNewDatas.find(user => {
          return user.lineNumber === 2
        })

        //Só dispara as notificações se houver mais de 2 jogadores na partida
        if(usersWithNewDatas.length > 2) {
          io.to(userCredentials.hall).emit("notify-next-fight", nextFighter)
          io.to(userCredentials.hall).emit("notify-player-is-waiting", firstOfThoseWhoWait)
        }

        io.to(userCredentials.hall).emit("getUsers", usersWithNewDatas);
        io.to(userCredentials.hall).emit("report", new ReportModel(
          "game_server",
          "log",
          `${data.winner.name} vs ${nextFighter.name}.`,
          false,
          new Date()
        ));
        io.to(userCredentials.hall).emit("fight-status","start-fight")
      })
    
      socket.on('disconnect', async () => {
        console.log('Um cliente se desconectou.');
        console.log("Credenciais de saída:",userCredentials)
        const thisPlayerById = await UserController.findUserById(userCredentials.userId)
        console.log("ESTE PLAYER", thisPlayerById)
        console.log("CREDENCIAIS", userCredentials)

        if(thisPlayerById.data){
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
            io.to(userCredentials.hall).emit("fight-status","start-fight")
          } else if(isAPlayerFighting && !isThereMoreThanOne){
            io.to(userCredentials.hall).emit("fight-status","stand-by")
          }

          //Caso não haja nenhum player na "room", o último a sair remove o documento...
          //que representa a sala do banco de dados.
          if(!io.sockets.adapter.rooms.get(userCredentials.hall)?.size){
            await HallController.deleteHall(userCredentials.hall)
          }
        }

      });
    });
}
