const User = require("../models/User")

module.exports = class UserController {
    static async createInHall(req, res){
        const {name, hall} = req.params
        const data = await User.createInHall(name, hall)
        return res.send(data)
    }
}