class Network {
    constructor() {
        this.socket = io('ws://13.84.213.182:80');

        this.connectPromise = new Promise(resolve => {
            this.socket.on('connect', () => {
                this.socket.emit('join');
                resolve();
            });
        })
    }

    connect(state, loopRef) {
        this.connectPromise.then(() => {
            this.socket.on('update', (newUpdate) => { state.handleUpdate(newUpdate) })
            this.socket.on('disconnect', () => { clearInterval(loopRef) })
        })
    }
}