const { describe, it } = require('node:test');
const { Writable } = require('node:stream');
const assert = require('node:assert');

const { public_key, encryptable_data_stream, encrypted_64 } = require('./utils');

const { encrypt } = require('../commands/encrypt');

describe('Encryption', () => {
	it('Should encrypt small piece of data', (test, done) => {
		const { encrypted_file_stream } = encrypt({
			input: encryptable_data_stream,
			public_key,
			password: Buffer.from('xnojggF22+1we6xwhcO7/aGUMVpSzgDy'),
			initial_vector: Buffer.from('EeF28NIZPEHU8bVu')
		});

		let data = Buffer.from([]);
		const magic_reader = new Writable({
			write: (chunk, encoding, callback) => {
				data = Buffer.concat([data, chunk]);
				callback(null);
			}
		});

		encrypted_file_stream.pipe(magic_reader);

		magic_reader.on('finish', () => {
			try {
				assert.equal(data.toString('base64'), encrypted_64, 'Encrypted files do not match');
				done()
			} catch(e) {
				done(e);
			}
		});
	});
});
