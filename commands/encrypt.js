#!/usr/bin/env node
const path = require('node:path');
const fs = require('node:fs');
const OS = require('node:os');
const Crypto = require('node:crypto');
const { Readable, Transform, Duplex } = require('node:stream');

const cli = require('../lib/cli');


// Algo:
// - Create random password
// - Create IV
// - Encrypt file using random password
// - Encrypt password using RSA key
// - let a = Append `encrypted_file:IV:encrypted_password`

// We are Alice, in this case key is the publicKey from Bob
function encrypt({ input, public_key, password, initial_vector } = {}) {
	if(!input || !public_key) {
		throw new Error('input and public_key are mandatory');
	}

	const random_password = password ?? Crypto.randomBytes(32);
	const iv = initial_vector ?? Crypto.randomBytes(16);

	const cipherStream = Crypto.createCipheriv('aes-256-cbc', random_password, iv);

	const encrypted_password = Crypto.publicEncrypt(public_key, random_password);

	let encrypted_file_stream = cipherStream;
	if(input instanceof Readable) {
		// We just need to pipe it
		input.pipe(encrypted_file_stream);

	} else {
		const partial_file = cipherStream.update(input);
		const rest_file = cipherStream.final();
		const encrypted_file = Buffer.concat([partial_file, rest_file]);

		encrypted_file_stream = Readable.from(encrypted_file);
	}

	// This is exported as a function since it pipes the stream
	// breaking the user's ability to do the same thing
	const get_result_stream = (output) => {
		output.write(iv);
		output.write(encrypted_password);

		encrypted_file_stream.pipe(output);

		return output;
	};

	// We return the stream and parameters separately in case
	// developers want to format the file differently
	return {
		encrypted_file_stream,
		encrypted_password,
		iv,
		get_result_stream
	};
}

function run() {
	let { options: { format, algorithm, output }, input, key } = cli({
		defaultKeyLocation: path.join(OS.homedir(), '.ssh/id_rsa.pub.pem')
	});

	const file_stream = output ? fs.createWriteStream(output) : process.stdout;

	const { get_result_stream } = encrypt({
		input,
		algorithm,
		public_key: key,
		format,
		output: file_stream
	});

	get_result_stream(file_stream);

	return new Promise((resolve, reject) => {
		file_stream.on('finish', () => {
			resolve();
		});

		file_stream.on('error', (err) => {
			console.error(err);
			reject(err);
		});

	}).then(() => {
		process.exit(0);
	});
}

// Run as CLI
if(require.main === module) {
	return run();
}

module.exports = {
	encrypt,
	run
};
