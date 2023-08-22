const DataPayload = require("../Utils/DataPayload")
const Hall = require("../models/Hall")

module.exports = class HallController {
    static async create(req, res){
        const { userName } = req.body
        let data
            if(userName) {
                data = await Hall.create(userName)
            } else {
                return res.send(new DataPayload(
                    false,
                    "Nome de usuário não preenchido.",
                    {}
                ))
            }

        return res.send(new DataPayload(
            true,
            "Sala e usuário criados com sucesso.",
            data
        ))
    }

    static async findHall(req, res){
        const number = req.query.number

        let data

        if(!number){
            return res.send(
                new DataPayload(
                    false,
                    "Número de sala não preenchido.",
                    {}
                )
            )
        } else {
            data = await Hall.findHall(number)
        }

        if(data){
            return res.send(
                new DataPayload(
                    true,
                    "Sala encontrada.",
                    data.number
                )
            )
        } else {
            return res.send(
                new DataPayload(
                    false,
                    "Sala não encontrada.",
                    {}
                )
            )
        }
    }

    static async deleteHall(hallNumber){
        let data

        if(!hallNumber){
            return new DataPayload(
                false,
                "O ID da sala não foi preenchido",
                {}
            )
        } else {
            const response = await Hall.deleteHall(hallNumber)
            data = response
        }

        if(data){
            return new DataPayload(
                true,
                "Sala excluída com sucesso.",
                {}
            )
        } else {
            return new DataPayload(
                false,
                "Sala não encontrada.",
                {}
            )
        }

    }
}