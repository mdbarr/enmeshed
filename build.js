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

const safeSubstitutions = {
  'LOWER_MASK': 'LM',
  'MATRIX_A': 'MA',
  'UPPER_MASK': 'UM',
  'address': 'a',
  'addresses': 'aa',
  'blink': 'b',
  'cameFrom': 'cf',
  'connected': 'cd',
  'connection': 'c',
  'complexity': 'cm',
  'current': 'cu',
  'decrement': 'dc',
  'description': 'de',
  'destination': 'd',
  'distance': 'di',
  'dotColor': 'do',
  'dropped': 'dr',
  'edge': 'e',
  'empty': 'em',
  'edge-cut': 'ec',
  'edge-empty': 'ee',
  'edge-empty-slow': 'ees',
  'edge-forward': 'ef',
  'edge-interact': 'ei',
  'edge-offline-empty': 'eoe',
  'edge-packet-empty': 'epe',
  'edge-packet-forward': 'epf',
  'edge-packet-reverse': 'epr',
  'edge-reverse': 'er',
  'edge-slow': 'es',
  'effect': 'et',
  'element': 'el',
  '\\bend\\b': 'en',
  'fade-out': 'fa',
  'fade-in': 'fi',
  '\\.forward': '.fo',
  'forward:': 'fo:',
  'goal': 'g',
  'hide': 'h',
  'hop': 'hp',
  'idealPath': 'ip',
  'interact': 'i',
  'interface': 'f',
  'maxHops': 'mh',
  'maxTTL': 'mt',
  'maxTicks': 'mk',
  'minimum': 'm',
  'node': 'n',
  'node-effect': 'ne',
  'node-effect-animate': 'nea',
  'node-effect-corrupt': 'nec',
  'node-effect-firewall': 'nef',
  'node-effect-intercept': 'nei',
  'node-effect-mine': 'neh',
  'node-effect-multiply': 'nem',
  'node-effect-reroute': 'ner',
  'node-effect-slow': 'nes',
  'node-effect-trace': 'net',
  'node-offline': 'no',
  'node-packet': 'np',
  'offline': 'o',
  'offline-banner': 'ob',
  'offline-fade': 'of',
  'online': 'on',
  'packet': 'p',
  'pathfinder': 'pf',
  'perturb': 'pe',
  'positions': 'ps',
  'quitText': 'q',
  'range': 'ra',
  '\\.reverse([^(])': '.r$1',
  'retryText': 'rt',
  'reverse:': 'r:',
  'scale': 'sc',
  'search': 'sa',
  'seed': 'se',
  'selected': 's',
  'self': 'sl',
  'sequence': 'sq',
  'speed': 'sp',
  '\\bstart\\b': 'st',
  'source': 'so',
  'ticks': 'ts',
  'toolbar': 'to',
  'tools': 't'
};

const substitutions = Object.keys(safeSubstitutions).sort(function(a, b) {
  if (a.length < b.length) {
    return 1;
  } else if (a.length > b.length) {
    return -1;
  }
  return 0;
});

const substitutionSet = new Set();
substitutions.forEach(function(key) {
  const item = safeSubstitutions[key];
  if (substitutionSet.has(item)) {
    console.log('Duplicate key in substitution list:', item);
    process.exit(0);
  }
  substitutionSet.add(item);
});

function bytes(number) {
  if (number >= 1000) {
    return String(number).replace(/(\d\d\d)$/, ',$1 bytes');
  } else {
    return number + ' bytes';
  }
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
fs.writeFileSync(BUILD_DIR + '/index.pre.js', script);

console.log('Linting original Javascript...');
try {
  child_process.execSync('./node_modules/.bin/eslint --fix ./build/index.pre.js', {
    stdio: 'inherit'
  });
} catch (error) {
  console.log('Linting failed.');
  process.exit(0);
}

const lintedScript = fs.readFileSync(BUILD_DIR + '/index.pre.js').toString();
if (lintedScript !== script) {
  console.log('  Updating index.html with linted JavaScript.');
  fs.writeFileSync(INDEX_HTML, html.replace('__SCRIPT__', lintedScript));
}
html = html.replace('__SCRIPT__', script);
console.log();

//////////
// Substitutions
console.log('Performing safe substitutions...');
let substitutedHTML = html;

const strings = [];
const stringReplacer = function(match, p1) {
  const bare = p1.replace(/['"`]/g, '');
  if (!safeSubstitutions[bare]) {
    const reference = '__STRING_' + strings.length + '__';
    strings.push(p1);
    return reference;
  }
  return p1;
};

substitutedHTML = substitutedHTML.replace(/\s*\/\/ IFDEF DEV[^]+?\/\/ ENDIF\s*/g, '');
substitutedHTML = substitutedHTML.replace(/(`[^`]*?`)/g, stringReplacer);
substitutedHTML = substitutedHTML.replace(/('[^']*?')/g, stringReplacer);
//substitutedHTML = substitutedHTML.replace(/("[^"]*?")/g, stringReplacer);

for (const key of substitutions) {
  const pattern = new RegExp(key, 'g');
  substitutedHTML = substitutedHTML.replace(pattern, safeSubstitutions[key]);
}

strings.forEach(function(item, index) {
  const reference = '__STRING_' + index + '__';
  substitutedHTML = substitutedHTML.replace(new RegExp(reference, 'g'), item);
});
substitutedHTML = substitutedHTML.replace(/([^.])console\.log\([^)]*?\);/g, '$1');
console.log('  index.html (%s) -> index.html (%s)\n', bytes(htmlSize), bytes(substitutedHTML.length));

//////////
// JavaScript
html = substitutedHTML.replace(/<script>([^]+)<\/script>/, function (match, p1) {
  script = p1;
  return '<script>__SCRIPT__</script>';
});
fs.writeFileSync(BUILD_DIR + '/index.sub.js', script);

console.log('Linting substituted Javascript...');
try {
  child_process.execSync('./node_modules/.bin/eslint --fix ./build/index.sub.js', {
    stdio: 'inherit'
  });
} catch (error) {
  console.log('Linting failed.');
  process.exit(0);
}
console.log();

console.log('Uglifying JavaScript...');
try {
  child_process.execSync('./node_modules/.bin/uglifyjs --compress --mangle --rename --toplevel --output ./build/index.min.js ./build/index.sub.js');
} catch (error) {
  console.log('UglifyJS failed');
  process.exit(0);
}
const minScript = fs.readFileSync(BUILD_DIR + '/index.min.js').toString();
console.log('  index.js (%s) -> index.min.js (%s)\n', bytes(script.length), bytes(minScript.length));

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
  process.exit(0);
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
console.log('  enmeshed.zip (%s => %s%)\n', bytes(zipStat.size), 100 - Math.floor((zipStat.size / htmlStat.size) * 100));

if (zipStat.size <= TARGET_SIZE) {
  console.log('Build succeeded! %s to spare!', bytes(TARGET_SIZE - zipStat.size));
  process.exit(0);
} else {
  console.log('Build failed! Zip files is %s over %s!', bytes(zipStat.size - TARGET_SIZE), bytes(TARGET_SIZE));
  process.exit(0);
}
