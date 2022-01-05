#!/usr/bin/env node
const OS = require('os');
const path = require('path');
const cli = require('./lib/cli');
const Crypto = require('crypto');
const fs = require('fs');

const { options: { format, algorithm, output }, variables, input, key } = cli({
	defaultKeyLocation: path.join(OS.homedir(), './.ssh/id_rsa')
});

const sign = Crypto.createSign(algorithm);

sign.update(input);

const signature = sign.sign(key);

if(output) {
	fs.writeFileSync(output, signature.toString(format));
	return process.exit(0);
}

return console.log(signature.toString(format));

