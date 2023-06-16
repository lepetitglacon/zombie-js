import mongoose from 'mongoose'

export default class MongooseSchemas {
    constructor() {

        this.schemas = new Map()
        this.models = new Map()

        mongoose.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
    }

    init() {
        this.userSchema = new mongoose.Schema({
            username: String,
            email: String,
            googleId: String
        });
        this.User = mongoose.model('User', this.userSchema);
    }

}