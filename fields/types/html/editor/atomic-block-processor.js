import _ from 'lodash';
// import sizeOf from 'image-size';
import ApiDataInstance from './api-data-instance';
import ENTITY from './entities';

const processor = {
	convertBlock (entityMap, block) {
		let alignment = 'center';
		let content;
		let entityRange = block.entityRanges[0];
		const entity = entityMap[entityRange.key];

		let type = _.get(entity, 'type', '');

		// backward compatible. Old entity type might be lower case
		switch (type && type.toUpperCase()) {
			case ENTITY.AUDIO.type:
			case ENTITY.BLOCKQUOTE.type:
			case ENTITY.EMBEDDEDCODE.type:
			case ENTITY.IMAGE.type:
			case ENTITY.INFOBOX.type:
			case ENTITY.SLIDESHOW.type:
			case ENTITY.IMAGEDIFF.type:
			case ENTITY.YOUTUBE.type:
				alignment = entity.data && entity.data.alignment || alignment;
				content = _.get(entity, 'data');
				content = Array.isArray(content) ? content : [content];
				break;
			default:
				return;
		}

		// block type of api data should be lower case
		return new ApiDataInstance({ id: block.key, alignment, type: type && type.toLowerCase(), content });
	},
};

export default processor;
