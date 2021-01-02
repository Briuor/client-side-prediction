class State {

    constructor() {
        this.firstServerTimestamp = 0;
        this.gameStart = 0;
        this.updates = [];
        this.RENDER_DELAY = 100;
        this.lastUpdate = null;
    }

    currentServerTime() {
        return this.firstServerTimestamp + (Date.now() - this.gameStart) - this.RENDER_DELAY;
    }


    getBaseUpdate() {
        const serverTime = this.currentServerTime();
        for (let i = this.updates.length - 1; i >= 0; i--) {
            if (this.updates[i].t <= serverTime) {
                return i;
            }
        }
        return -1;
    }

    // handle Update
    getCurrentState() {
        // if (!this.firstServerTimestamp) {
        //     return {};
        // }

        // const base = getBaseUpdate();
        // const serverTime = currentServerTime();

        return this.updates.shift();
    }

    handleUpdate(newUpdate) {
        this.updates.push(newUpdate);
        // if (!this.firstServerTimestamp) {
        //     this.firstServerTimestamp = newUpdate.t;
        //     this.gameStart = Date.now();
        // }

        // this.updates.push(newUpdate);
        // const base = this.getBaseUpdate();
        // if (base > 0) {
        //     this.updates.splice(0, base);
        // }
    }
}