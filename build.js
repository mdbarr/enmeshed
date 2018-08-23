#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const child_process = require('child_process');

const INDEX_HTML = path.join(process.cwd(), 'index.html');
const BUILD_DIR = path.join(process.cwd(), 'build');
const DIST_DIR = path.join(process.cwd(), 'dist');

const TARGET_SIZE = 13312;

function bytes(number) {
  return String(number).replace(/(\d\d\d)$/, ',$1 bytes');
}

let html = fs.readFileSync(INDEX_HTML).toString();
const htmlSize = html.length;

mkdirp.sync(BUILD_DIR);

//////////
// JavaScript
let script;
html = html.replace(/<script>([^]+)<\/script>/, function (match, p1) {
  script = p1;
  return '<script>__SCRIPT__</script>';
});
fs.writeFileSync(BUILD_DIR + '/index.js', script);

console.log('Linting Javascript...');
try {
  child_process.execSync('./node_modules/.bin/eslint --fix ./build/index.js', {
    stdio: 'inherit'
  });
} catch (error) {
  console.log('Linting failed.');
  process.exit(1);
}

const newScript = fs.readFileSync(BUILD_DIR + '/index.js').toString();
if (newScript !== script) {
  console.log('  Updating index.html with linted JavaScript.');
  fs.writeFileSync(INDEX_HTML, html.replace('__SCRIPT__', newScript));
}
console.log();

console.log('Uglifying JavaScript...');
try {
  child_process.execSync('./node_modules/.bin/uglifyjs --compress --mangle --rename --output ./build/index.min.js ./build/index.js');
} catch (error) {
  console.log('UglifyJS failed');
  process.exit(1);
}
const minScript = fs.readFileSync(BUILD_DIR + '/index.min.js').toString();
console.log('  index.js (%s) -> index.min.js (%s)\n', bytes(newScript.length), bytes(minScript.length));

//////////
// CSS
let style;
html = html.replace(/<style>([^]+)<\/style>/, function (match, p1) {
  style = p1;
  return '<style>__STYLE__</style>';
});

console.log('Minifying CSS...');
fs.writeFileSync(BUILD_DIR + '/index.css', style);
try {
  child_process.execSync('./node_modules/.bin/postcss ./build/index.css > ./build/index.min.css');
} catch (error) {
  console.log('PostCSS/CSSNano failed');
  process.exit(1);
}
const minStyle = fs.readFileSync(BUILD_DIR + '/index.min.css').toString();
console.log('  index.css (%s) -> index.min.css (%s)\n', bytes(style.length), bytes(minStyle.length));

//////////
// HTML
console.log('Building compressed HTML...');
html = html.split(/\n+/).map(x => x.trim()).join('').replace(/>[\s\n]+</g, '><');
const compressedHTML = html.replace('__SCRIPT__', minScript).replace('__STYLE__', minStyle);
mkdirp.sync(DIST_DIR);
fs.writeFileSync(DIST_DIR + '/index.html', compressedHTML);

const htmlStat = fs.statSync(DIST_DIR + '/index.html');
console.log('  index.html (%s) -> dist/index.html (%s)\n', bytes(htmlSize), bytes(htmlStat.size));

/////////
// Zip
console.log('Building Zip archive...');
process.chdir(DIST_DIR);
child_process.execSync('zip enmeshed.zip index.html');

const zipStat = fs.statSync('enmeshed.zip');
console.log('  enmeshed.zip (%s)\n', bytes(zipStat.size));

if (zipStat.size <= TARGET_SIZE) {
  console.log('Build succeeded! %s to spare!', bytes(TARGET_SIZE - zipStat.size));
  process.exit(0);
} else {
  console.log('Build failed! Zip file too big!!');
  process.exit(1);
}
