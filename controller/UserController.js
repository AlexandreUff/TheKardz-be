const User = require("../models/User")
const Hall = require("../models/Hall")

module.exports = class UserController {
    static async createInHall(req, res){
        const {name, hall} = req.body

        let data

        if(name && hall){
            data = await User.createInHall(name, hall, Hall)
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