export default class MysteryBoxManager extends EventTarget{

    constructor({game}) {
        super()
        this.game = game

        this.timeToOpen = 8000 // ms

        this.BOXES = new Map()
        this.box = null

        this.bind()
    }

    addBox(mesh) {
        const box = new Box(mesh)
        this.BOXES.set(box.id, box)
    }

    bind() {
        this.addEventListener('player_trying_to_open_mysterybox', (e) => {
            if (!this.BOXES.has(e.mysteryBoxId)) return console.log('door not found')
            if (!this.game.PLAYERS.has(e.userId)) return console.log('player not found')

            const door = this.BOXES.get(e.mysteryBoxId)
            if (door.isOpen) return console.log('MysteryBox is already open, wait for your turn')
            const player = this.game.PLAYERS.get(e.userId)

            if (player.points >= door.price) {
                console.log('player bought mysterybox')

                door.isOpen = true
                player.points -= door.price

                // TODO send player points info
                this.game.io.to(this.game.gameId).emit('game:players:points', this.game.preparePlayersPoints())

                console.log(`[MYSTERYBOX] ${e.mysteryBoxId} opened`)
                this.game.io.to(this.game.gameId).emit('game:mysterybox:open', {
                    mysteryBoxId: e.mysteryBoxId
                })

                setTimeout(() => {
                    this.game.io.to(this.game.gameId).emit('game:mysterybox:close', {
                        mysteryBoxId: e.mysteryBoxId
                    })
                    door.isOpen = false
                }, this.timeToOpen)
            } else {
                console.log('player cant afford mysterybox')
            }

        })
    }
}

class Box {

    static idCounter = 0

    constructor(mesh) {
        this.id = mesh.name

        this.mesh = mesh
        this.room = mesh.userData.RoomId
        this.price = mesh.userData.Price
        this.name = mesh.name
        this.position = mesh.position
    }
}