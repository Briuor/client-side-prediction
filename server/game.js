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

    handleInput(socket, move) {
        if (this.players[socket.id]) {
            this.players[socket.id].moves.push(move);
        }
    }

    update() {

        let now = Date.now();
        let dt = now - this.lastUpdateTime;
        this.lastUpdateTime = now;

        // move player
        let ack;
        Object.keys(this.players).forEach(playerId => {
            let player = this.players[playerId];
            let pendingMoves = this.players[playerId].moves;
            while (this.players[playerId].moves.length > 0) {
                var move = this.players[playerId].moves.shift();
                if (move) {
                    console.log(move.direction)
                    this.players[playerId].setDirection(move.direction);
                    this.players[playerId].move(dt);
                }
            }
            
        });

        // send update event to each client
        Object.keys(this.sockets).forEach(socketId => {
            let me = this.players[socketId];
            // let otherPlayers = Object.values(this.players).filter(p => p !== me);
            this.sockets[socketId].emit('update', { ts: now, me });
        });
    }
}

module.exports = Game;