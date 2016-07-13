var gcsHelper = require('../../../lib/gcsHelper');
var keystone = require('../../../');

module.exports = {
	upload: function (req, res) {
		if (req.files && req.files.file) {
			var gcsConfig = keystone.get('gcs config') || {};

			var bucket = gcsHelper.initBucket(gcsConfig);

			var destination = gcsConfig.destination || '';

			var file = req.files.file;

			// Upload a local file to a new file to be created in your bucket.
			gcsHelper.uploadFileToBucket(bucket, file.path, {
				destination: destination + file.originalname, // gcs.uploadDirectory
			}).then(function (uploadedFile) {
				return gcsHelper.makeFilePublicPrivateRead(uploadedFile, gcsConfig.publicRead);
			}).then(function (response) {
				var sendResult = function () {
					return res.send({
						image: {
							url: gcsConfig.url + destination + file.originalname,
						},
					});
				};
				res.format({
					html: sendResult,
					json: sendResult,
				});
			}).catch(function (err) {
				var sendResult = function () {
					return res.send({
						error: {
							message: err.message,
						},
					});
				};
				res.format({
					html: sendResult,
					json: sendResult,
				});
			});
		} else {
			res.json({
				error: {
					message: 'no image selected',
				},
			});
		}
	},
	get: function (req, res) {
		var gcsConfig = keystone.get('gcs config');
		var bucket = gcsHelper.initBucket(gcsConfig);
		var destination = gcsConfig.destination || '';

		bucket.getFiles({
			prefix: destination,
		}, function (err, files) {
			if (err) {
				return res.json({
					error: {
						message: err.message,
					},
				});
			}

			var file;
			files.forEach(function (ele) {
				if (ele.name === (destination + req.query.id)) {
					file = ele;
				}
			});

			if (file) {
				return res.json({
					item: file,
				});
			}

			res.json({
				error: {
					status: 404,
					message: 'file is not found',
				},
			});

		});
	},
};
