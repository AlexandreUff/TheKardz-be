const conn = require('../db/conn')

class User {
    static UserConnection = conn.db().collection("user")

    static async create(name, hall){
        const user = await this.UserConnection.insertOne({
                name,
                victories: 0,
                loses: 0,
                hall,
                ping: true,
                isFighting: false,
                consecutives: 0,
                lineNumber: 0
            })

        return user
    }

    static async createInHall(name, hall, HallModel){
        let user

        const isExistsThisHall = await HallModel.findHall(hall)

        if(!isExistsThisHall) return {
            status: false,
            message: "O número desta sala é inválido ou não existe mais.", //Fazer um este para esse payload
            data: null
        }

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

            await HallModel.insertUserInHall(
                user.insertedId.toString(),
                hall
            )
        } else {
            return {
                status: false,
                message: "Nome de usuário já em uso nesta sala.",
                data: null
            }
        }

        return {
            status: true,
            message: "Usuário criado com sucesso.",
            data: {
                userId: user.insertedId
            }
        }
    }

    static async findSuchUserInHall(name, hall){
        const user = await this.UserConnection.findOne({name, hall})

        return user
    }
}

module.exports = User