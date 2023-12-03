#!/usr/bin/env node

const OS = require('node:os');
const path = require('node:path');
const Crypto = require('node:crypto');
const fs = require('node:fs');

const cli = require('../lib/cli');

// In the case of sign, we use our own private key to sign a document
// Bob can use our public key to cehck the signature
function sign({ input, private_key, } = {}) {
	if(!input || !private_key) {
		throw new Error('input and private_key are mandatory');
	}

	const sign = Crypto.createSign('RSA-SHA256');

	return new Promise((resolve, reject) => {
		input.on('end', () => {
			try {
				sign.end();
				const signature = sign.sign(private_key);
				return resolve(signature);
			} catch(e) {
				reject(e);
			}
		});

		input.on('error', e => reject(e));
		sign.on('error', e => reject(e));

		input.pipe(sign);
	});
}

function run() {
	const { options: { format, output }, input, key } = cli({
		defaultKeyLocation: path.join(OS.homedir(), './.ssh/id_rsa')
	});

	return sign({
		input,
		private_key: key,
	}).then(signature => {
		if(output) {
			fs.writeFileSync(output, signature.toString(format));
			return process.exit(0);
		}

		console.log(signature.toString(format));
	});
}


if(require.main === module) {
	return run();
}

module.exports = {
	sign,
	run
};
