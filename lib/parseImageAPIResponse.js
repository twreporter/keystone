module.exports = function(apiResponse) {
    let image = _.get(apiResponse, [ 'fields', 'image'], {})
    let description = _.get(apiResponse, [ 'fields', 'description'], '')
    let keywords = _.get(apiResponse, [ 'fields', 'keywords'], '')
    // use desktop version url for rendering
    let resizedUrl = _.get(image, ['resizedTargets', 'desktop', 'url' ], image.url)
    _.set(image, [ 'src' ], resizedUrl);
    image = Object.assign(image, {id: apiResponse.id, description, keywords});
    return image;
};
