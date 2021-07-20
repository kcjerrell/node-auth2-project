const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../secrets"); // use this secret!

module.exports = function (user) {
	const payload = {
		subject: user.user_id,
		username: user.username,
		role_name: user.role_name,
	}

	/** @type {jwt.SignOptions} */
	const options = {
		expiresIn: '1d',
	}

	return jwt.sign(payload, JWT_SECRET, options);
}
