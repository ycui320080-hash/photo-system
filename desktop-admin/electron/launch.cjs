process.env.ELECTRON_CACHE = require('node:path').resolve(__dirname, '../../.npm-cache/electron');
const { spawn } = require('node:child_process');
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const child = spawn(require('electron'), ['.', ...process.argv.slice(2)], {
  cwd: require('node:path').resolve(__dirname, '..'),
  env,
  stdio: 'inherit',
  windowsHide: true,
});
child.on('exit', (code) => process.exit(code || 0));
