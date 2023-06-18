import {MongoClient} from "mongodb";

export default class DatabaseHandler {

    constructor() {
        let url = "mongodb://127.0.0.1:27017/"
        this.client = new MongoClient(url);

        this.databaseName = 'z3d'
    }

    async init() {

    }

    async insertGame(game) {
        try {
            // Connect to the MongoDB cluster
            await this.client.connect()

            let db = this.client.db('z3d')
            console.log(db)
            let users = db.collection('games')
            console.log(users)

            let res = await users.updateOne(
                {id: game.id},
                {$set: game},
                {upsert: true}
            )
        } catch (e) {
            console.error(e);
        } finally {
            await this.client.close();
        }
    }

    async insertUser(user) {
        try {
            // Connect to the MongoDB cluster
            await this.client.connect()

            let db = this.client.db('z3d')
            console.log(db)
            let users = db.collection('users')
            console.log(users)

            let res = await users.updateOne(
                {id: user.id},
                {$set: user},
                {upsert: true}
            )
        } catch (e) {
            console.error(e);
        } finally {
            await this.client.close();
        }
    }


}