const HallNumberGerator = require('../Utils/HallNumberGerator')
const conn = require('../db/conn')

class Hall {

    static HallConnection = conn.db().collection("hall")

    static async create(){
        let hall

        const hallNumberGerated = HallNumberGerator()

        const isThereThisNumber = await this.findHall(hallNumberGerated)

        if(!isThereThisNumber){
            hall = await this.HallConnection.insertOne({
                number: hallNumberGerated,
                members: []
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