const conn = require('../db/conn')

class User {
    static UserConnection = conn.db().collection("user")

    static async create(name, hall){
        let user

        const isThereThisUser = await this.findSuchUserInHall(name, hall)

        if(!isThereThisUser){
            user = await this.UserConnection.insertOne({
                name,
                victories: 0,
                loses: 0,
                hall,
                ping: true,
                isFighting: false,
                consecutives: 0,
                lineNumber: 0
            })
        } else {
            return {
                isCreated: false,
                message: "Nome de usuário já em uso nesta sala.",
                data: null
            }
        }

        return {
            isCreated: true,
            message: "Usuário criado com sucesso.",
            data: user
        }
    }

    static async findSuchUserInHall(name, hall){
        const user = await this.UserConnection.findOne({name, hall})

        return user
    }
}

module.exports = User