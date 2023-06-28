const Hall = require("../models/Hall")

module.exports = class GameController {
    static async connect(req, res){
        const test = await Hall.create()
        return res.send(test)
    }
}