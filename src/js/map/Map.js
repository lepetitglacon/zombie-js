export default class Map {

    constructor(props) {
        this.width = 500
        this.depth = 500


        this.rooms = []
    }

    addRoom(room) {
        this.rooms.push(room)
    }

    addToScene(scene) {
        for (const roomIndex in this.rooms) {
            this.rooms[roomIndex].addToScene(scene)
        }
    }

}