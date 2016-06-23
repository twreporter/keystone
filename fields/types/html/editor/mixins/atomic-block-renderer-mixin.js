'use strict';
import _ from 'lodash';

let AtomicBlockRendererMixin = (superclass) => class extends superclass {
    constructor(props) {
        super(props);
        this.state = {
            data:  this._getValue(props) || {}
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: this._getValue(nextProps) || {}
        });
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
}

export default AtomicBlockRendererMixin;
