'use strict'

const Commands = require('commands');
const ASTDIN = require('node-async-stdin');

const DAEMON = require('./lib/spawn-daemon.js');

const commands = new Commands();
const astdin = new ASTDIN();

function parseTime(str) {
    let ms = 0;
    if (str && str.length) {
        switch (str[str.length - 1]) {
            case 's':
                ms += 1000 * parseInt(str.substr(0, str.length - 1));
                break;
            case 'm':
                ms += 60 * 1000 * parseInt(str.substr(0, str.length - 1));
                break;
            case 'h':
                ms += 60 * 60 * 1000 * parseInt(str.substr(0, str.length - 1));
                break;
            case 'd':
                ms += 24 * 60 * 60 * 1000 * parseInt(str.substr(0, str.length - 1));
                break;
            default:
                ms += parseInt(str);
                break
        }
    }
    return ms;
}

(async () => {
    let lines = [];

    commands.addcommand('sleep', async (argv) => {
        let ms = 0;
        for (let i = 0; i < argv.length; i++) {
            ms += parseTime(argv[i]);
        }
        lines.push({
            type: 'sleep',
            argv: ms
        });
    });

    commands.addcommand('exec', async (argv) => {
        lines.push({
            type: 'exec',
            argv: argv
        });
    });

    commands.addcommand('clear', async () => {
        lines = [];
    })

    let spawntype = 'node';

    while (true) {
        console.log('Enter spawn type [\'node\']');
        let line = await astdin.line();
        if(line == 'node') {
            break;
        }
        // else if(line == 'pm2') {
        //     spawntype = 'pm2';
        //     break;
        // }
    }

    console.log('Enter sudo password');
    var sudopass = await astdin.line();

    while (true) {
        console.log('Enter command [exec ... | sleep ... | clear | end]')
        let line = await astdin.line();
        if (line == 'end') {
            break;
        }
        let command = commands.parse(line);
        if (command && command.func) {
            await command.func(command.argv);
        }
    }

    console.log('===');
    console.log('START');
    for(let i = 0; i < lines.length; i++) {
        if(lines[i].type == 'exec') {
            console.log('' + (i + 1) + '.', 'EXECUTE', lines[i].argv.join(' '));
        }
        else if (lines[i].type == 'sleep') {
            console.log('' + (i + 1) + '.', 'SLEEP FOR', lines[i].argv, 'ms');
        }
    }
    console.log('END');

    while (true) {
        console.log('You can type ENTER after spawn to terminate process');
        console.log('Is this OK? [y/n]');
        let line = await astdin.line();
        if(line == 'n') {
            process.exit(0);
        }
        else if (line == 'y') {
            console.log('SPAWNING...');
            let daemon = new DAEMON(lines, spawntype, sudopass);
            daemon.on('stdout', (line) => {
                console.log(line);
            });
            daemon.on('stderr', (line) => {
                console.log('ERR', line);
            });
            let sig = await astdin.line();
            console.log('TERMINATING PROCESS');
            process.exit(0);
        }
    }
})();