const { ObjectId } = require('mongodb');
const conn = require('../db/conn')

class User {

    constructor(name, hall, lineNumber){
        this.name = name;
        this.victories = 0;
        this.loses = 0,
        this.hall = hall,
        this.ping = true,
        this.isFighting = false,
        this.consecutives = 0,
        this.lineNumber = lineNumber
    }

    static UserConnection = conn.db().collection("user")

    static async create(name, hall){
        const user = await this.UserConnection.insertOne(new User(name, hall, 1))

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
            const linePosition = await this.UserConnection.countDocuments({hall})
            user = await this.UserConnection.insertOne(new User(name, hall, linePosition + 1))

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

    static async deleteUserById(userId){
        const response = await this.UserConnection.deleteOne({_id: new ObjectId(userId)})

        return response
    }

    static async updateUser(user){
        const response = await this.UserConnection.updateOne(
            {_id: new ObjectId(user._id)},
            {$set:{...user}}
            )

        return response
    }
}

module.exports = User