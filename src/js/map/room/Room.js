export default class Room {

    constructor(props) {


        this.walls = []
    }

    addWall(wall) {
        this.walls.push(wall)
    }

    addToScene(scene) {
        for (const wallIndex in this.walls) {
            this.walls[wallIndex].addToScene(scene)
        }
    }

}