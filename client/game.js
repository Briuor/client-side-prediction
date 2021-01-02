
class Game {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.canvas.style.background = "black"

        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth - 4;
        this.canvas.height = window.innerHeight - 4;

        this.state = new State();
        this.network = new Network();
        this.player = new Player(100, 100)

        this.lastUpdateTime = Date.now();

        document.addEventListener('keydown', (e) => this.handleKeyBoardInput(e, true));
        document.addEventListener('keyup', (e) => this.handleKeyBoardInput(e, false));

        this.savedMoves = [];
    }

    isDirection(code) {
        return (code == 68 || code == 39 || code == 83 || code == 40 || code == 65 || code == 37 || code == 87 || code == 38)
    }

    handleKeyBoardInput(e, value) {
        if (this.isDirection(e.which)) {
            this.network.socket.emit('input', { keyCode: e.which, value });
        }
    }

    drawPlayers(otherPlayers, color) {
        otherPlayers.forEach(p => this.drawPlayer(ctx, color));
    }

    drawPlayer(me, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(me.x, me.y, me.r, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    // Main Loop
    run() {
        let {me} = this.state.getCurrentState();
        
        // draw
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawPlayer(me, 'red');
    }

    start() {
        this.canvas.style.display = 'block';
        Promise.all([this.network.connect(this.state)]).then(() => {
            setInterval(this.run.bind(this), 1000 / 60);
        });
    }
}