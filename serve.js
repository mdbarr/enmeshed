#!/usr/bin/env node

'use strict';
const fs = require('fs');
const child_process = require('child_process');

require('http-server/bin/http-server');

function rebuild() {
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

let debounce;

fs.watch('./index.html', {
  persistent: true
}, function() {
  if (debounce) {
    clearTimeout(debounce);
  }
  debounce = setTimeout(rebuild, 100);
});
