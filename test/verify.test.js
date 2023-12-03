const { describe, it } = require('node:test');
const assert = require('node:assert');

const { public_key, signature, signable_data_stream } = require('./utils');

const { verify } = require('../commands/verify');

describe('Verify signature', () => {
	it('Should validate a simple signature', () => {
		return verify({
			public_key,
			input: signable_data_stream,
			signature,
		}).then(valid => {
			assert(valid, 'Signature is not valid');
		});
	});
});
