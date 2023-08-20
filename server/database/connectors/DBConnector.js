import Logger from "../../Logger.js";

export default class DBConnector {

    constructor(props) {

        Logger.server(`using ${props.database.name}`, 'database')

    }

}