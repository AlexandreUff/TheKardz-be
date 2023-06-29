const Hall = require("../models/Hall")

module.exports = class HallController {
    static async connect(req, res){
        const test = await Hall.create()
        return res.send(test)
    }
}