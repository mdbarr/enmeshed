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

const last = {};
const options = {
  interval: 2500
};

function rebuild(which, curr, prev) {
  if (!last[which] || last[which].mtime != curr.mtime) {
    last.which = curr;

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

fs.watchFile('./index.html', options, (curr, prev) => rebuild('index.html', curr, prev));
fs.watchFile('./build.js', options, (curr, prev) => rebuild('build.js', curr, prev));
