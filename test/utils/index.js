const fs = require('node:fs');
const path = require('node:path');
const { Readable } = require('node:stream');

const private_key = fs.readFileSync(path.join(__dirname, './rsa-private.pem'));
const public_key = fs.readFileSync(path.join(__dirname, './rsa-public.pem'));

const signature_b64 = fs.readFileSync(path.join(__dirname, './signature')).toString().trim();

const signable_data = 'test data to sign';
const encryptable_data = 'some_data_to_encrypt';

const encrypted_64 = fs.readFileSync(path.join(__dirname, './encrypted-simple.enc64')).toString().trim();

module.exports = {
	private_key,
	public_key,
	signature_b64,
	signature: Buffer.from(signature_b64, 'base64'),
	signable_data,
	signable_data_stream: Readable.from(signable_data),
	encryptable_data,
	encrypted_64,
	encryptable_data_stream: Readable.from(encryptable_data),
};
