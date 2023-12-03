#!/usr/bin/env node
const Crypto = require('node:crypto');
const OS = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

const cli = require('../lib/cli');

function verify({ public_key, signature, input } = {}) {
	if(!input || !public_key || !signature) {
		throw new Error('input, signature and public_key are mandatory');
	}

	const verifier = Crypto.createVerify('RSA-SHA256');

	return new Promise((resolve, reject) => {
		input.on('end', () => {
			try {
				const valid = verifier.verify(public_key, signature);
				resolve(valid);
			} catch(e) {
				reject(e);
			}
		});

		input.on('error', e => reject(e));
		verifier.on('error', e => reject(e));

		input.pipe(verifier);
	});
}

function run() {
	const {
		options: {
			format,
			signature: signature_option,
			verbose
		},
		variables,
		input,
		key 
	} = cli({
		args: {
			s: 'signature',
		},
		defaultKeyLocation: path.join(OS.homedir(), '.ssh/id_rsa.pub.pem')
	});

	if(!signature_option) {
		throw new Error('Please provide a signature file using the option -s or --signature')
	}

	const signature = Buffer.from(fs.readFileSync(signature_option).toString('utf8'), format);

	return verify({
		public_key: key,
		signature,
		input,
	}).then(valid => {
		if(valid) {
			if(verbose) {
				console.log('Signature is valid!');
			}
			return process.exit(0);
		}	

		if(verbose) {
			console.error('Signature is invalid');
		}
		process.exit(1);
	});
}


if(require.main === module) {
	return run();
}

module.exports = {
	verify,
	run
};
