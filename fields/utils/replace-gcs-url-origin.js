const storage = {
  google: {
    schema: 'https',
    hostname: 'storage.googleapis.com',
    bucket: 'twreporter-multimedia',
  },
};

module.exports = function replaceGCSUrlOrigin(url = '') {
  const { schema, hostname, bucket } = storage.google;
  const toReplace = 'https://www.twreporter.org';
  const toBeReplaced = `${schema}://${hostname}/${bucket}`;
  return url.replace(toBeReplaced, toReplace);
};
