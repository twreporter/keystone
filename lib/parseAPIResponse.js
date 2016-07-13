import _ from 'lodash';
function composeImageSet (imageObj = {}) {
	let resizedTargets = _.get(imageObj, 'resizedTargets');
	if (!resizedTargets) {
		return imageObj;
	}
	let original = {
		url: imageObj.url,
		width: imageObj.width,
		height: imageObj.height,
	};
	let image = {};
	return _.merge(image, resizedTargets, {
		original: original,
		url: _.get(resizedTargets, ['tablet', 'url']),
		description: imageObj.description,
		keywords: imageObj.keywords,
		id: imageObj.id,
	});
}

module.exports.parseImageAPIResponse = function (apiResponse) {
	let imageObj = _.get(apiResponse, ['fields', 'image'], {});
	let id = apiResponse.id;
	let description = _.get(apiResponse, ['fields', 'description']);
	let keywords = _.get(apiResponse, ['fields', 'keywords']);
	let image = _.merge({}, imageObj, { id, description, keywords });
	return composeImageSet(image);
};

module.exports.parseAudioAPIResponse = function (apiResponse) {
	let audio = _.get(apiResponse, ['fields', 'audio'], {});
	audio = _.pick(audio, ['filetype', 'title', 'url']);
	let coverPhoto = composeImageSet(_.get(apiResponse, ['fields', 'coverPhoto'], {}));
	let description = _.get(apiResponse, ['fields', 'description', 'html'], '');
	let title = _.get(apiResponse, ['fields', 'title'], '');
	audio = _.merge(audio, { id: apiResponse.id, coverPhoto, description, title });
	return audio;
};
