const electron = require('electron')
const path = require('path')
const fs = require('fs')

let defaultConfig = {
    'port': 8675,
    'path': path.join(__dirname, 'clips')
}

class Store {
    constructor(opts) {
        this.path = path.join((electron.app || electron.remote.app).getPath('userData'), 'RandomVideo.conf');
        if(!fs.existsSync(this.path)) fs.writeFileSync(this.path, JSON.stringify(defaultConfig));
        this.data = JSON.parse(fs.readFileSync(this.path, 'utf8'));
    }
    get(key) {
        try {
            return this.data[key];
        } catch {
            throw "FUCK!";
        }
    }
    set(key, val) {
        this.data[key] = val;
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }
}
module.exports = Store;