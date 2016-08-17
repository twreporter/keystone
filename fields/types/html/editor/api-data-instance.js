import { Record } from 'immutable';
import shortid from 'shortid';

const ApiDataInstanceRecord = Record({
	id: shortid.generate(),
	type: 'paragraph',
	alignment: 'center',
	content: [],
	styles: {},
});

class ApiDataInstance extends ApiDataInstanceRecord {
	constructor (props) {
		let id = props && props.id || shortid.generate();
		props.id = id;
		super(props);
	}
	getId () {
		return this.get('id');
	}
	getType () {
		return this.get('type');
	}
	getAlignment () {
		return this.get('alignment');
	}
	getContent () {
		return this.get('content');
	}
	getStyles () {
		return this.get('styles');
	}
}

export default ApiDataInstance;
