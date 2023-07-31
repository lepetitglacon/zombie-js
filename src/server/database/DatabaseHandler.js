import MongoConnector from "./connectors/MongoConnector.js";

export default class DatabaseHandler {

    constructor(props) {


        switch (props.database.name) {
            case 'mongo':
                this.connector = new MongoConnector(props)
                break;
            case 'js':

                break;
        }
    }

    async connect() {
        return this.connector.connect()
    }

}