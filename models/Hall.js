const HallNumberGerator = require('../Utils/HallNumberGerator')
const conn = require('../db/conn')
const User = require('./User')

class Hall {

    static HallConnection = conn.db().collection("hall")

    static async create(userName){
        let hall

        const hallNumberGerated = HallNumberGerator()

        const isThereThisNumber = await this.findHall(hallNumberGerated)

        if(!isThereThisNumber){
            const user = await User.create(userName, hallNumberGerated)
            hall = await this.HallConnection.insertOne({
                number: hallNumberGerated,
                members: [user.insertedId.toString()]
            })
        } else {
            await this.create()
        }

        return hall
    }

    static async findHall(hallNumber){
        const hall = await this.HallConnection.findOne({ number: hallNumber })

        return hall
    }
}

module.exports = Hall