'use strict';
import _ from 'lodash';

let AtomicBlockRendererMixin = (superclass) => class extends superclass {
	constructor (props) {
		super(props);
		this.state = {
			data: this._getValue(props) || {},
			editMode: false,
		};
		this.value = null;
		this.toggleEditMode = this._toggleEditMode.bind(this);
		this.onValueChange = this._onValueChange.bind(this);
	}

	componentWillReceiveProps (nextProps) {
		this.setState({
			data: this._getValue(nextProps) || {},
		});
	}
	componentWillUnmout () {
		this.value = null;
	}

	_getValue (props) {
		const blockKey = props.block.getKey();
		let blocks = _.get(props, ['blockProps', 'data'], []);
		let rtn = null;
		for (let block of blocks) {
			if (_.get(block, 'id') === blockKey) {
				rtn = _.merge({}, block);
				break;
			}
		}
		return rtn;
	}

	_toggleEditMode (e) {
		if (typeof _.get(e, 'stopPropagation') === 'function') {
			e.stopPropagation();
		}
		this.setState({
			editMode: !this.state.editMode,
		});
	}

	// override by children to update the data back to parent component
	_onValueChange (value) {
		this.value = value;
		this.props.blockProps.onFinishEdit(this.props.block.getKey(), this.value);
	}
};

export default AtomicBlockRendererMixin;
