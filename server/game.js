const Player = require('./player');

class Game {
    constructor() {
        this.sockets = [];
        this.players = [];
        this.bullets = [];
        setInterval(this.update.bind(this), 1000 / 60);
        this.lastUpdateTime = Date.now();
    }

    addPlayer(socket) {
        this.sockets[socket.id] = socket;
        this.players[socket.id] = new Player(100, 100);
    }

    removePlayer(socket) {
        delete this.sockets[socket.id];
        delete this.players[socket.id];
    }

    handleInput(socket, input) {
        if (this.players[socket.id]) {
            this.players[socket.id].inputs.push(input);
            console.log('Received:', this.players[socket.id].inputs.length)
        }
    }

    update() {

        let now = Date.now();
        let dt = now - this.lastUpdateTime;
        this.lastUpdateTime = now;

        // move player
        Object.keys(this.players).forEach(playerId => {
            console.log(this.players[playerId].inputs.length)
            while (this.players[playerId].inputs.length > 0) {
                var input = this.players[playerId].inputs.shift()
                this.players[playerId].setDirection(input.direction);
                this.players[playerId].move(dt);
                this.players[playerId].lastAck = input.ack;
                // console.log('(' + this.players[playerId].x+','+ this.players[playerId].y+')');
            }
        });

        // send update event to each client
        Object.keys(this.sockets).forEach(socketId => {
            let me = this.players[socketId];
            let otherPlayers = Object.values(this.players).filter(p => p !== me);
            this.sockets[socketId].emit('update', { t: Date.now(), me, otherPlayers });
        });
    }
}

module.exports = Game;