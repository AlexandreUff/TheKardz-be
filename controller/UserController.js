const User = require("../models/User")

module.exports = class UserController {
    static async createInHall(req, res){
        const {name, hall} = req.body

        let data

        if(name){
            data = await User.createInHall(name, hall)
        } else {
            data = {
                isCreated: false,
                message: "O nome usuário deve ser preenchido",
                data: {},
            }
        }
        
        return res.send(data)
    }
}