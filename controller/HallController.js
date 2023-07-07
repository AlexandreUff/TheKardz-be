const DataPayload = require("../Utils/DataPayload")
const Hall = require("../models/Hall")

module.exports = class HallController {
    static async create(req, res){
        const { userName } = req.body
        let data
            if(userName) {
                data = await Hall.create(userName)
            } else {
                return res.send(/* {
                    status: false,
                    message: "Nome de usuário não preenchido.",
                    data: {}
                } */ new DataPayload(
                    false, "Nome de usuário não preenchido.", {}
                ))
            }

        return res.send(/* {
            status: true,
            message: "Sala e usuário criados com sucesso.",
            data
        } */ new DataPayload(true, "Sala e usuário criados com sucesso.", data))
    }

    static async findHall(req, res){
        const number = req.query.number

        let data

        if(!number){
            return res.send(/* {
                status: false,
                message: "Número de sala não preenchido.",
                data: {}
            } */new DataPayload(false, "Número de sala não preenchido.", {}))
        } else {
            data = await Hall.findHall(number)
        }

        if(data){
            return res.send(/* {
                status: true,
                message: "Sala encontrada.",
                data: data.number
            } */new DataPayload(true, "Sala encontrada.", data.number))
        } else {
            return res.send(/* {
                status: false,
                message: "Sala não encontrada.",
                data: {}
            } */new DataPayload(false, "Sala não encontrada.", {}))
        }
    }
}