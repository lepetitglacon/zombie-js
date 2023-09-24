export default class GunShopManager extends EventTarget {

    constructor({game}) {
        super()
        this.game = game

        this.timeToOpen = 2000 // ms

        /** @type {Map<any, GunShop>} */ this.GUNSHOPS = new Map()

        this.bind()
    }

    addGunShop(mesh) {
        const gs = new GunShop(mesh)
        this.GUNSHOPS.set(gs.id, gs)
    }

    bind() {
        this.addEventListener('player_trying_to_buy_weapon', (e) => {
            if (!this.GUNSHOPS.has(e.gunShopId)) return console.log('Gun shop not found')
            if (!this.game.PLAYERS.has(e.userId)) return console.log('player not found')

            const door = this.GUNSHOPS.get(e.gunShopId)
            /** @type SocketRequestHandler */ const player = this.game.PLAYERS.get(e.userId)

            console.log(door.price, player.points)

            if (player.points >= door.price) {
                console.log('player bought weapon')

                player.points -= door.price
                this.game.io.to(this.game.gameId).emit('game:players:points', this.game.preparePlayersPoints())

                player.socket.emit('game:weapon:bought', {
                    weaponName: door.weaponName
                })
                console.log(`Player ${player.user._id} bought ${door.weaponName}`)
            } else {
                console.log(`player ${player.user._id} cant afford weapon ${door.weaponName}`)
            }

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