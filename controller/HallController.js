const Hall = require("../models/Hall")

module.exports = class HallController {
    static async create(req, res){
        const { userName } = req.body
        let data
            if(userName) {
                data = await Hall.create(userName)
            } else {
                return res.send({
                    isCreated: false,
                    message: "Nome de usuário não preenchido.",
                    data: {}
                })
            }

        return res.send({
            isCreated: true,
            message: "Sala e usuário criados com sucesso.",
            data
        })
    }
}