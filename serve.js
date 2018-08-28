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

require('http-server/bin/http-server');

let debounce;
let last;
function rebuild() {
  const stat = fs.statSync('./index.html');
  if (stat.mtimeMs !== last) {
    last = stat.mtimeMs;
    debounce = null;

    console.log('\nindex.html changed, rebuilding...');
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

fs.watch('./index.html', {
  persistent: true
}, function() {
  if (debounce) {
    clearTimeout(debounce);
  }
  debounce = setTimeout(rebuild, 250);
});
