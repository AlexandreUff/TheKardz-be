module.exports = class UserController {
    static async gameConnection(req, res){
        return res.send("The game has been connected.")
    }
}