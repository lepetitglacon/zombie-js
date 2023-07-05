import dotenv from "dotenv";
import mongoose from 'mongoose'
import DBConnector from "./DBConnector.js";

export default class MongoConnector extends DBConnector{

    constructor(props) {
        super(props)
	dotenv.config()

        this.databaseName = process.env.DB_CONNECTOR_MONGO_DBNAME
        this.username = process.env.DB_CONNECTOR_MONGO_USERNAME
        this.password = process.env.DB_CONNECTOR_MONGO_PASSWORD

        this.url = `mongodb://0.0.0.0:27017/${this.databaseName}`

        console.log(this.url)
	// Connect to MongoDB
        mongoose.connect(this.url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => console.log('Connected to MongoDB'))
            .catch(err => console.error('Failed to connect to MongoDB', err));

    }

}
