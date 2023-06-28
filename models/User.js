const conn = require('../db/conn')

class User {
    static UserConnection = conn.db().collection("user")

    static async create(name){
        const user = await this.UserConnection.insertOne({
            name,
            victories: 0,
            loses: 0,
            hall: "",
            ping: true,
            isFighting: false,
            consecutives: 0,
            lineNumber: 0
        })
    }

    static async findSuchUserInHall(name, hallNumber){
        const user = await this.UserConnection.findOne({name, hallNumber})

        return user
    }
}

module.exports = User