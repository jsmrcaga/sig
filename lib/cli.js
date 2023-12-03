const fs = require('node:fs');
const { Readable } = require('node:stream');

const argumentate = require('argumentate');

module.exports = ({ args={}, defaultKeyLocation }={}) => {
	const { options, variables } = argumentate(process.argv.slice(2), {
		i: 'input',
		k: 'key',
		o: 'output',
		v: 'verbose',
		f: 'format',
		...args
	});

	const [ inputFile ] = variables;

	const {
		format = 'base64',
		key:key_path = defaultKeyLocation,
		input = null,
		output = null
	} = options;

	if(!input && !inputFile) {
		throw new Error('Please specify an input with -i or as a file');
	}

	if(!key_path) {
		throw new Error('Please specify a key location using -k or --key');
	}

	const key = fs.readFileSync(key_path);

	let inputValue;

	// Input value will always be a Readable stream
	if(input) {
		inputValue = Readable.from(input);
	} else {
		// from file
		inputValue = fs.createReadStream(inputFile);
	}

	return {
		options: {
			...options,
			format,
		},
		variables,
		input: inputValue,
		key
	};
};
