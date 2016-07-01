'use strict';
import _ from 'lodash';

let AtomicBlockRendererMixin = (superclass) => class extends superclass {
    constructor(props) {
        super(props);
        this.state = {
            data:  this._getValue(props) || {},
            editMode: false
        }
        this.value = null;
        this.handleClick = this._handleClick.bind(this);
        this.handleFinish = this._handleFinish.bind(this);
        this.onValueChange = this._onValueChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: this._getValue(nextProps) || {}
        });
    }
    componentWillUnmout() {
        this.value = null;
    }

    _getValue(props) {
        const blockKey = props.block.getKey();
        let blocks = _.get(props, [ 'blockProps', 'data'], []);
        let rtn = null;
        for(let block of blocks) {
            if (_.get(block, 'id') === blockKey) {
                rtn = _.merge({}, block);
                break;
            }
        }
        return rtn;
    }

    _handleClick(e) {
        e.stopPropagation();
        if (this.state.editMode) {
            return;
        }

        this.setState({
            editMode: true,
        });
    }

    _handleFinish() {
        this.setState({
            editMode: false,
        });

        this.props.blockProps.onFinishEdit(this.props.block.getKey(), this.value);
    }

    // need to override by children to update the data back to parent component
    _onValueChange(value) {
        this.value = value;
    }

}

export default AtomicBlockRendererMixin;
