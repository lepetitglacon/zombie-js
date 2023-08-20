import dotenv from "dotenv";
import mongoose from 'mongoose'
import DBConnector from "./DBConnector.js";
import Logger from "../../Logger.js";

export default class MongoConnector extends DBConnector{

    constructor(props) {
        super(props)
	    dotenv.config()

        this.databaseName = process.env.DB_CONNECTOR_MONGO_DBNAME
        this.username = process.env.DB_CONNECTOR_MONGO_USERNAME
        this.password = process.env.DB_CONNECTOR_MONGO_PASSWORD

        this.url = `mongodb://0.0.0.0:27017/${this.databaseName}`

        Logger.server(`Mongo URL: ${this.url}`, 'database')
    }

    async connect() {
        try {
            mongoose.connect(this.url, { useNewUrlParser: true, useUnifiedTopology: true })
            Logger.server(`Connected to MongoDB`, 'database')
        } catch (e) {
            Logger.server(`Failed to connect to MongoDB`, 'database')
            console.error(e)
        }
    }

}
