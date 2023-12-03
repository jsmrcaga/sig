const { describe, it } = require('node:test');
const assert = require('node:assert');

const { private_key, signable_data_stream, signature_b64 } = require('./utils');

const { sign } = require('../commands/sign');

describe('Signature', () => {
	it('Should create simple signature', () => {
		return sign({
			input: signable_data_stream,
			private_key
		}).then(signature => {
			assert.equal(signature.toString('base64'), signature_b64, 'Signatures do not match');
		});
	});
});
