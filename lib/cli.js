const argumentate = require('argumentate');
const fs = require('fs');

module.exports = ({ args={}, defaultKeyLocation }) => {
	const { options, variables } = argumentate(process.argv.slice(2), {
		alg: 'algorithm',
		i: 'input',
		k: 'key',
		o: 'output',
		v: 'verbose',
		...args
	});

	const [ inputFile ] = variables;

	const {
		format = 'base64',
		key:key_path = defaultKeyLocation,
		algorithm = 'RSA-SHA256',
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

	const inputValue = input ?? fs.readFileSync(inputFile);

	return {
		options: {
			...options,
			format,
			algorithm,
		},
		variables,
		input: inputValue,
		key
	};
};
