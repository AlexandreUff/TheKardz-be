const Hall = require("../models/Hall")

module.exports = class HallController {
    static async create(req, res){
        console.log(req.body)
        const { userName } = req.body
        let data
        if(userName) {
            data = await Hall.create(userName)
        } else {
            data = "O nome do usuário não foi preenchido."
        }
        return res.send(data)
    }
}