var gcloud = require('gcloud');

module.exports.getPublicUrl = function(bucket, filename) {
    return 'https://storage.googleapis.com/' +
        bucket +
        '/' + filename;
};

module.exports.uploadFileToBucket = function(bucket, filepath, opts) {
    return new Promise(function(resolve, reject) {
        bucket.upload(filepath, opts, function(err, uploadedFile) {
            if (err) {
                return reject(err);
            }
            resolve(uploadedFile);
        })
    });
};

module.exports.makeFilePublicPrivateRead = function(file, isPublicRead) {
    return new Promise(function(resolve, reject) {
        if (isPublicRead) {
            file.makePublic(function(err, apiResponse) {
                if (err) {
                    return reject(err);
                }
                resolve(apiResponse);
            });
        } else {
            file.makePrivate(function(err, apiResponse) {
                if (err) {
                    return reject(err);
                }
                resolve(apiResponse);
            });
        }
    });
};

module.exports.initBucket = function(config, bucket) {
    var gcs = gcloud.storage({
        projectId: config.projectId,
        keyFilename: config.keyFilename
    });

    return gcs.bucket(bucket);
};

module.exports.getGcsFiles = function(bucket, filename) {
    return new Promise(function(resolve, reject) {
        bucket.getFiles({
            prefix: filename
        }, function(err, files) {
            if (err) {
                return reject(err);
            }
            resolve(files);
        })
    });
}
