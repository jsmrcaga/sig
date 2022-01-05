#!/usr/bin/env node
const cli = require('./lib/cli');
const Crypto = require('crypto');
const OS = require('os');
const path = require('path');
const fs = require('fs');

const {
	options: {
		format,
		algorithm,
		signature: signatureOption,
		verbose
	},
	variables,
	input,
	key 
} = cli({
	args: {
		s: 'signature',		
	},
	defaultKeyLocation: path.join(OS.homedir(), './.ssh/id_rsa.pub.pem')
});


let [ inputFile, signatureFile ] = variables;
// In case we call "-i <input> ./signature.sign"
if(!signatureFile && inputFile && !signatureOption) {
	signatureFile = inputFile;
}

// Signature was saved in the specified format, no need to parse again
const signature = signatureOption ?? fs.readFileSync(signatureFile).toString();

if(!signature) {
	console.error('Please specify a signature to verify');
	return process.exit(1);
}

const verifier = Crypto.createVerify(algorithm);

verifier.update(input);

const valid = verifier.verify(key, signature, format);

if(valid) {
	if(verbose) {
		console.log('Signature is valid!');
	}
	return process.exit(0);
}

// We decided that it's better to show a message everytime
console.error('Signature is invalid');
process.exit(1);

