const HallNumberGerator = require('../Utils/HallNumberGerator')
const conn = require('../db/conn')

class Hall {

    HallConnection = conn.db().collection("hall")

    static async create(){
        let hall

        const hallNumberGerated = HallNumberGerator()

        const isThereThisNumber = await this.findHall(hallNumberGerated)

        if(!isThereThisNumber){
            hall = await HallConnection.insertOne({
                number: hallNumberGerated,
                members: []
            })
        } else {
            await this.create()
        }

        return hall
    }

    static async findHall(hallNumber){
        const hall = await HallConnection.findOne({ number: hallNumber })

        return hall
    }
}

module.exports = Hall