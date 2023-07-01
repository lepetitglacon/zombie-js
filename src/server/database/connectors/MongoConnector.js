import mongoose from 'mongoose'
import DBConnector from "./DBConnector.js";

export default class MongoConnector extends DBConnector{

    constructor(props) {
        super(props)

        this.databaseName = 'z3d'
        this.url = "mongodb://127.0.0.1:27017/z3d"

        // Connect to MongoDB
        mongoose.connect(this.url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => console.log('Connected to MongoDB'))
            .catch(err => console.error('Failed to connect to MongoDB', err));

    }

}