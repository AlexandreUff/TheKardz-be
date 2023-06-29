const User = require("../models/User")

module.exports = class UserController {
    static async create(req, res){
        const {name, id} = req.params
        const data = await User.createInHall(name, id)
        return res.send(data)
    }
}