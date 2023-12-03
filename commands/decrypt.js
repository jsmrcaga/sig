#!/usr/bin/env node
const OS = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const Crypto = require('node:crypto');
const { Readable, Transform, Writable } = require('node:stream');

const cli = require('../lib/cli');


// Algo:
// - Create random password
// - Create IV
// - Encrypt file using random password
// - Encrypt password using RSA key
// - let a = Append `encrypted_file:IV:encrypted_password`

// This is from publicEncrypt (always returns 512 bytes)
const ENCRYPTED_KEY_LENGTH = 512;
// This is from our own choosing
const IV_LENGTH = 16;

class DecipherTransform extends Transform {
	constructor({ output, private_key, ...options }) {
		if(!(output instanceof Writable)) {
			console.log(output);
			throw new Error('output is required to be an instanceof Writable (can be Duplex/Transform as well)');
		}

		super(options);
		this.encrypted_key = Buffer.from([]);
		this.decrypted_key = null;
		this.iv = Buffer.from([]);

		this.private_key = private_key;

		// Init piping immediately
		this.decipher_stream = null;
		this.output = output;
	}

	get secret_key() {
		if(this.decrypted_key) {
			return this.decrypted_key;
		}

		this.decrypted_key = Crypto.privateDecrypt(this.private_key, this.encrypted_key);
		return this.decrypted_key;
	}

	get ready() {
		return this.iv.length === IV_LENGTH && this.encrypted_key.length === ENCRYPTED_KEY_LENGTH;
	}

	get inited() {
		// if there is a decipher stream we are essentially inited
		// but we need to check that IV is set to 16 bytes & that our shared secret key is set
		return this.decipher_stream && this.iv.length === IV_LENGTH && this.decrypted_key;
	}

	init() {
		this.decipher_stream = Crypto.createDecipheriv('aes-256-cbc', this.secret_key, this.iv);
		this.pipe(this.decipher_stream).pipe(this.output);

		this.decipher_stream.on('end',(...args) => this.emit('decipher_end', ...args));
	}

	_transform(chunk, encoding, callback) {
		let offset = 0;
		if(this.iv.length < IV_LENGTH) {
			const iv_offset = IV_LENGTH - this.iv.length;
			this.iv = Buffer.concat([this.iv, chunk.subarray(0, iv_offset)]);
			offset = iv_offset;
		}

		if(this.encrypted_key.length < ENCRYPTED_KEY_LENGTH) {
			const key_offset = ENCRYPTED_KEY_LENGTH - this.encrypted_key.length + offset;
			this.encrypted_key = Buffer.concat([this.encrypted_key, chunk.subarray(offset, key_offset)]);
			offset = key_offset;
		}

		if(!this.inited && this.ready) {
			this.init();
		}

		const rest = chunk.subarray(offset, chunk.length);
		callback(null, rest);
	}
}

// We are Bob, in this case key is our own private key
function decrypt({ input, key, output } = {}) {
	if(!input || !key) {
		throw new Error('input and key are mandatory');
	}

	const decipherTransform = new DecipherTransform({
		private_key: key,
		output
	});

	let result_stream;
	if(input instanceof Readable) {
		result_stream = input.pipe(decipherTransform);

	} else {
		const input_buffer = Readable.from(input);
		result_stream = input_buffer.pipe(decipherTransform);
	}

	return result_stream;
}

// Run as CLI
if(require.main === module) {
	let { options: { format, algorithm, output }, input, key } = cli({
		defaultKeyLocation: path.join(OS.homedir(), '.ssh/id_rsa')
	});

	const file_stream = output ? fs.createWriteStream(output) : process.stdout;

	const decipher_stream = decrypt({
		input,
		key,
		output: file_stream
	});

	return new Promise((resolve, reject) => {
		decipher_stream.on('decipher_end', () => {
			file_stream.end();
		});

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

module.exports = {
	decrypt
};
