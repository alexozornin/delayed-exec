'use strict'

const CHILD = require('./child.js');

if (process.argv.length != 4) {
    console.log('Wrong argument amount, expected 1');
    process.exit(-1);
}
let lines = JSON.parse(process.argv[2]);
let sudopass = process.argv[3];

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, ms);
    })
}

(async () => {
    console.log('START');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].type == 'exec') {
            console.log('EXECUTING',lines[i].argv.join(' '));
            let child = new CHILD(lines[i].argv, sudopass);
            child.on('stdout', (line) => {
                console.log('STDOUT', line);
            });
            child.on('stderr', (line) => {
                console.log('STDERR', line);
            });
        }
        else if (lines[i].type == 'sleep') {
            await sleep(lines[i].argv);
        }
    }
})();
