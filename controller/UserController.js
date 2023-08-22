const User = require("../models/User")
const Hall = require("../models/Hall")
const DataPayload = require("../Utils/DataPayload")

module.exports = class UserController {
    static async createInHall(req, res){
        const {name, hall} = req.body

        let response

        if(name && hall){
            const hallDatas = await User.createInHall(name, hall, Hall)
            response = new DataPayload(hallDatas.status, hallDatas.message, hallDatas.data)
        } else {
            response = new DataPayload(false, "O nome usuário deve ser preenchido.", {})
        }

        return res.send(response)
    }

    static async findUserById(userId){
        let response

        const data = await User.findUserById(userId)

        if(data){
            response = new DataPayload(true, "Usuário encontrado com sucesso", data)
        } else {
            response = new DataPayload(false, "Usuário não encontrado.", data)
        }

        return response
    }

    static async getAllUsersInSuchHall(hallNumber){
        const data = await User.getAllUsersInSuchHall(hallNumber)

        const response = new DataPayload(true, "Usuários listados com sucesso", data)

        return response
    }

    static async deleteUserById(userId){
        const data = await User.deleteUserById(userId)
        let response

        if(data){
            response = new DataPayload(true, "Usuário removido com sucesso.", data)
        } else {
            response = new DataPayload(false, "Nenhum usuário foi encontrado.", data)
        }

        return response
    }

    static async updateUser(user){
        const data = await User.updateUser(user)

        const response = new DataPayload(true, "Dados do usuário alterados com sucesso", data)

        return response
    }
}