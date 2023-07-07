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
            response = /* {
                status: false,
                message: "O nome usuário deve ser preenchido",
                data: {},
            } */ new DataPayload(false, "O nome usuário deve ser preenchido.", {})
        }

        return res.send(response)
    }
}