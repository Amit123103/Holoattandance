import { spawn } from 'child_process';
import fs from 'fs';

const build = spawn('npm', ['run', 'build'], { shell: true });

let logStream = fs.createWriteStream('debug_build.log');

build.stdout.on('data', (data) => {
    process.stdout.write(data);
    logStream.write(data);
});

build.stderr.on('data', (data) => {
    process.stderr.write(data);
    logStream.write(data);
});

build.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    logStream.end();
});
