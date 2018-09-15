'use strict'

const EventEmitter = require('events');
const path = require('path');
const readline = require('readline');
const child = require('child_process');

class DAEMON extends EventEmitter {
    constructor(lines, spawntype, sudopass) {
        super();
        this.daemonpath = path.join(__dirname, 'daemon.js');
        this.lines = lines;
        this.spawntype = spawntype;
        this.sudopass = sudopass;
        this.init();
    }

    init() {
        this.daemon = child.spawn(this.spawntype, [this.daemonpath, JSON.stringify(this.lines), this.sudopass]);

        this.rlStdout = readline.createInterface({
            input: this.daemon.stdout
        });

        this.rlStderr = readline.createInterface({
            input: this.daemon.stderr
        });

        this.rlStdout.on('line', (line) => {
            this.emit('stdout', line);
        });

        this.rlStderr.on('line', (line) => {
            this.emit('stderr', line);
        });
    }

    write(str) {
        this.daemon.stdin.write(str);
    }

    kill() {
        this.daemon.kill('SIGTERM');
    }
}

module.exports = DAEMON;