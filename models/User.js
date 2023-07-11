const conn = require('../db/conn')

class User {

    constructor(name, hall){
        this.name = name;
        this.victories = 0;
        this.loses = 0,
        this.hall = hall,
        this.ping = true,
        this.isFighting = false,
        this.consecutives = 0,
        this.lineNumber = 0
    }

    static UserConnection = conn.db().collection("user")

    static async create(name, hall){
        const user = await this.UserConnection.insertOne(new User(name, hall))

        return user
    }

    static async createInHall(name, hall, HallModel){
        let user

        const isExistsThisHall = await HallModel.findHall(hall)

        if(!isExistsThisHall) return {
            status: false,
            message: "O número desta sala é inválido ou não existe mais.",
            data: {}
        }

        const isThereThisUser = await this.findSuchUserInHall(name, hall)

        if(!isThereThisUser){
            user = await this.UserConnection.insertOne(new User(name, hall))

            await HallModel.insertUserInHall(
                user.insertedId.toString(),
                hall
            )
        } else {
            return {
                status: false,
                message: "Nome de usuário já em uso nesta sala.",
                data: {}
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

    static getAllUsersInSuchHall(hallNumber){
        const users = this.UserConnection.find({ hall: hallNumber }).toArray()

        return users
    }
}

module.exports = User