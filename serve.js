#!/usr/bin/env node

'use strict';
const fs = require('fs');
const child_process = require('child_process');
try {
  child_process.execSync('./build.js', {
    stdio: 'inherit'
  });
  console.log();
} catch (error) {
  console.log(error);
  process.exit(1);
}

process.argv.push('./dist/');
require('http-server/bin/http-server');

let which;
let debounce;
let last;

function rebuild() {
  const stat = fs.statSync('./index.html');
  if (stat.mtimeMs !== last) {
    last = stat.mtimeMs;
    debounce = null;

    console.log(`\n${ which } changed, rebuilding...`);
    child_process.exec('./build.js', function(error, stdout, stderr) {
      if (error || stderr) {
        console.log(stderr);
      }
      if (stdout) {
        console.log(stdout);
      }
    });
  }
}

fs.watchFile('./index.html', {
  persistent: true,
  interval: 250
}, function() {
  if (debounce) {
    clearTimeout(debounce);
  }
  which = 'index.html';
  debounce = setTimeout(rebuild, 250);
});

fs.watchFile('./build.js', {
  persistent: true,
  interval: 250
}, function() {
  if (debounce) {
    clearTimeout(debounce);
  }
  which = 'build.js';
  debounce = setTimeout(rebuild, 250);
});
