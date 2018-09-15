'use strict'

const EventEmitter = require('events');
const readline = require('readline');
const child = require('child_process');

class CHILD extends EventEmitter {
    constructor(argv, sudopass) {
        super();
        if(!sudopass) {
            sudopass = '';
        }
        if (argv && argv[0] && argv[0] == 'sudo') {
            argv[0] = 'echo \'' + sudopass + '\' | sudo -kS';
        }
        this.argv = argv.join(' ');
        this.init();
    }

    init() {
        this.child = child.exec(this.argv);

        this.rlStdout = readline.createInterface({
            input: this.child.stdout
        });

        this.rlStderr = readline.createInterface({
            input: this.child.stderr
        });

        this.rlStdout.on('line', (line) => {
            this.emit('stdout', line);
        });

        this.rlStderr.on('line', (line) => {
            this.emit('stderr', line);
        });
    }

    write(str) {
        this.child.stdin.write(str);
    }

    kill() {
        this.child.kill('SIGTERM');
    }
}

module.exports = CHILD;