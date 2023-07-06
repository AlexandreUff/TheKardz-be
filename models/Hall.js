const HallNumberGerator = require('../Utils/HallNumberGerator')
const conn = require('../db/conn')
const User = require('./User')

class Hall {

    static HallConnection = conn.db().collection("hall")

    static async create(userName){
        let data

        const hallNumberGerated = HallNumberGerator()

        const isThereThisNumber = await this.findHall(hallNumberGerated)

        if(!isThereThisNumber){
            const user = await User.create(userName, hallNumberGerated)
            await this.HallConnection.insertOne({
                number: hallNumberGerated,
                members: [user.insertedId.toString()],
                isPublic: false,
                name: "",
            })

            data = {
                user: user.insertedId.toString(),
                hall: hallNumberGerated,
            }

        } else {
            await this.create()
        }

        return data
    }

    static async findHall(hallNumber){
        const hall = await this.HallConnection.findOne({ number: hallNumber })

        return hall
    }

    static async insertUserInHall(userId, hallNumber){
        const data = await this.HallConnection.updateOne(
            {number: hallNumber},
            {$addToSet: { members: userId }}
        )

        return data
    }
}

module.exports = Hall