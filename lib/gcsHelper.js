var Storage = require('@google-cloud/storage');

module.exports.getAuthenticatedUrl = function (bucket, filname) {
  return 'https://storage.cloud.google.com/'
    + bucket
    + '/' + filename;
}

module.exports.getPublicUrl = function (bucket, filename) {
  return 'https://storage.googleapis.com/'
    + bucket
    + '/' + filename;
};

module.exports.uploadFileToBucket = function (bucket, fileReadStream, options) {
  return new Promise(function (resolve, reject) {
    var opts = options || {};
    var file = bucket.file(opts.destination);
    var metadata = {};

    if (opts.filetype) {
      metadata.contentType = opts.filetype;
    }

    if (opts.cacheControl) {
      metadata.cacheControl = opts.cacheControl;
    }

    fileReadStream
      .pipe(file.createWriteStream({
        metadata: metadata,
      }))
      .on('error', function (err) {
        console.log(err);
        reject(err);
      })
      .on('finish', function () {
        console.log('finish uploading to bucket with destionation:', opts.destination);
        file.makePublic(function (err, apiResponse) {
          if (err) {
            return reject(err);
          }
          resolve(apiResponse);
        });
      });
  });
};

module.exports.makeFilePublicPrivateRead = function (file, isPublicRead) {
  return new Promise(function (resolve, reject) {
    if (isPublicRead) {
      file.makePublic(function (err, apiResponse) {
        if (err) {
          return reject(err);
        }
        resolve(apiResponse);
      });
    } else {
      file.makePrivate(function (err, apiResponse) {
        if (err) {
          return reject(err);
        }
        resolve(apiResponse);
      });
    }
  });
};

module.exports.initBucket = function (config, bucket) {
  var gcs = new Storage({
    projectId: config.projectId,
    keyFilename: config.keyFilename,
  });

  return gcs.bucket(bucket);
};

module.exports.getGcsFiles = function (bucket, filename) {
  return new Promise(function (resolve, reject) {
    bucket.getFiles({
      prefix: filename,
    }, function (err, files) {
      if (err) {
        return reject(err);
      }
      resolve(files);
    });
  });
};
