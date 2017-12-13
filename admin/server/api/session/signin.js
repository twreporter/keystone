var speakeasy = require('speakeasy');
var utils = require('keystone-utils');
var keystone = require('../../../../');
var session = require('../../../../lib/session');

function signin (req, res) {
	if (!req.body.email || !req.body.password) {
		return res.status(401).json({ error: 'NO_EMAIL_OR_PASSWORD' });
	}
	if (!req.body.securitycode) {
		return res.status(401).json({ error: 'NO_SECURITY_CODE' });
	}
	var User = keystone.list(keystone.get('user model'));
	var emailRegExp = new RegExp('^' + utils.escapeRegExp(req.body.email) + '$', 'i');
	User.model.findOne({ email: emailRegExp }).exec(function (err, user) {
		if (user) {
			if (!user.secretEnabled) {
				return res.status(401).json({ error: { clientMessageType: 'SECURITY_CODE_NOT_ENABLED' } });
			}
			const verified = speakeasy.totp.verify({
				secret: user.secretKey,
				encoding: 'base32',
				token: req.body.securitycode,
			});
			console.log('verified', verified);
			if (!verified) {
				return res.status(401).json({ error: { clientMessageType: 'INVALID_SECURITY_CODE' } });
			}
			keystone.callHook(user, 'pre:signin', function (err) {
				if (err) return res.json({ error: 'pre:signin error', detail: err });
				user._.password.compare(req.body.password, function (err, isMatch) {
					if (isMatch) {
						session.signinWithUser(user, req, res, function () {
							keystone.callHook(user, 'post:signin', function (err) {
								if (err) return res.json({ error: 'post:signin error', detail: err, clientMessageType: '' });
								res.json({ success: true, user: user });
							});
						});
					} else if (err) {
						return res.status(500).json({ error: 'bcrypt error', detail: err });
					} else {
						return res.json({ error: 'invalid details' });
					}
				});
			});
		} else if (err) {
			return res.status(500).json({ error: 'database error', detail: err });
		} else {
			return res.json({ error: 'invalid details' });
		}
	});
}

module.exports = signin;
