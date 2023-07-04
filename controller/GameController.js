const SocketConnectionStart = require('../services/SocketService')

module.exports = class UserController {
    static async gameConnection(req, res){
        console.log("Agora vai")
        /* SocketConnectionStart() */
        return res.send("The game has been connected with all respect.")
    }
}