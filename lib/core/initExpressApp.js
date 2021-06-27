module.exports = function initExpressApp () {
	if (this.app) return this;
	this.initDatabaseConfig();
	this.initExpressSession(this.mongoose);
	this.app = require('../../server/createApp')(this);
	return this;
};
