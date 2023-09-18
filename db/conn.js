const { MongoClient } = require('mongodb')
require('dotenv').config()

const DB_USER = process.env.DB_USER
const DB_PASS = process.env.DB_PASS

const mongoDB_URI = DB_USER && DB_PASS ? 
    `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.dnmojxv.mongodb.net/?retryWrites=true&w=majority` :
    "mongodb://localhost:27017/thekardz"

const uri = mongoDB_URI

const client = new MongoClient(uri)

async function run(){
    try {
        await client.connect()
        console.log("Banco conectado com sucesso")
    } catch (error) {
        console.log("Erro ao conectar-se com o banco.", error)
    }
}

run()

module.exports = client