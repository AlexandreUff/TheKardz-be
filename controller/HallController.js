const Hall = require("../models/Hall")

module.exports = class HallController {
    static async connect(req, res){
        const { userName } = req.params
        const test = await Hall.create(userName)
        return res.send(test)
    }
}