export default class GunShopManager extends EventTarget {

    constructor({game}) {
        super()
        this.game = game

        this.timeToOpen = 2000 // ms

        this.GUNSHOPS = new Map()

        this.bind()
    }

    addGunShop(mesh) {
        const gs = new GunShop(mesh)
        this.GUNSHOPS.set(gs.id, gs)
    }

    bind() {
        this.addEventListener('player_trying_to_buy_weapon', (e) => {
            // if (!this.GUNSHOPS.has(e.doorId)) return console.log('door not found')
            // if (!this.game.PLAYERS.has(e.userId)) return console.log('player not found')
            //
            // const door = this.GUNSHOPS.get(e.doorId)
            // const player = this.game.PLAYERS.get(e.userId)
            //
            // console.log(door.price, player.points)
            //
            // if (player.points >= door.price) {
            //     console.log('player bought door')
            //
            //     player.points -= door.price
            //
            //     // TODO send player points info
            //     this.game.io.to(this.game.gameId).emit('game:players:points', this.game.preparePlayersPoints())
            //
            //     this.game.zombieFactory.makeSpawnersAvailableForRooms(door.rooms)
            //
            //     console.log(`[DOORS] ${e.doorId} opened`)
            //     this.game.io.to(this.game.gameId).emit('game:door:before_open', {
            //         doorId: e.doorId
            //     })
            //
            //     setTimeout(() => {
            //         this.game.io.to(this.game.gameId).emit('game:door:open', {
            //             doorId: e.doorId
            //         })
            //         door.isOpen = true
            //         // this.game.DOORS.delete(e.doorId)
            //     }, this.timeToOpen)
            // } else {
            //     console.log('player cant afford door')
            // }

        })
    }
}

class GunShop {

    static idCounter = 0

    constructor(mesh) {
        this.id = mesh.name

        this.mesh = mesh
        this.weaponName = mesh.userData.weaponName
        this.price = mesh.userData.Price
        this.name = mesh.name
        this.position = mesh.position
    }
}