const Hall = require("../models/Hall")

module.exports = class HallController {
    static async create(req, res){
        const { userName } = req.params
        const data = await Hall.create(userName)
        return res.send(data)
    }
}