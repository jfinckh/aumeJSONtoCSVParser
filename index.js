#! /usr/bin/env node


const fs = require('fs');
const _ = require('lodash');

const metric = require('./metric');

// Need to specify location of JSON file
if (process.argv[2] === undefined) {
	console.error('[INFO]: Usage - aumeConverter <input>');
	process.exit(1);
}

// Need to be able to find and validate JSON file
let input = {};
try {
	input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
    metric.metric(input);
} catch (e) {
	console.error('[ERROR]: Could not read JSON export you specified');
	process.exit(1);
}

