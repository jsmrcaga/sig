const { sign } = require('../commands/sign');
const { verify } = require('../commands/verify');
const { encrypt } = require('../commands/encrypt');
const { decrypt } = require('../commands/decrypt');

module.exports = {
	sign,
	verify,
	encrypt,
	decrypt
};
