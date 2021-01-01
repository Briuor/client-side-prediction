
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

        this.pendingInputs = [];
    }

    isDirection(code) {
        return (code == 68 || code == 39 || code == 83 || code == 40 || code == 65 || code == 37 || code == 87 || code == 38)
    }

    handleKeyBoardInput(e, value) {
        if (this.isDirection(e.which)) {
            this.player.updateDirection(e.which, value);
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
        let state = this.state.getCurrentState();
        let me = state ? state.me : null;

        let now = Date.now();
        let dt = now - this.lastUpdateTime;
        this.lastUpdateTime = now;


        if (state && me) {

            // reconciliation
            this.player.x = me.x;
            this.player.y = me.y;

            let j = 0;
            while (j < this.pendingInputs.length) {
                var input = this.pendingInputs[j];
                if (input.ack <= me.lastAck) {
                    // Already processed. Its effect is already taken into account into the world update
                    // we just got, so we can drop it.
                    this.pendingInputs.splice(j, 1);
                } else {
                    // Not processed by the server yet. Re-apply it.
                    this.player.setDirection(input.direction);
                    this.player.move(dt);
                    j++;
                }
            }

            // client prediction
            let direction = this.player.move(dt);
            let newInput = { direction, ack: this.player.ack };
            this.network.socket.emit('input', newInput);
            this.pendingInputs.push(newInput);
            this.player.ack++;
            console.log('Player: ', this.player);
            console.log('ME', me);

            // draw
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawPlayer(me, 'red');
            this.drawPlayer(this.player, 'blue');  
        }
      
    }

    start() {
        this.canvas.style.display = 'block';
        Promise.all([this.network.connect(this.state)]).then(() => {
            setInterval(this.run.bind(this), 1000 / 60);
        });
    }
}