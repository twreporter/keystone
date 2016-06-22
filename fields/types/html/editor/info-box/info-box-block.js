'use strict';

import { Entity } from 'draft-js';
import { AlignedInfoBox } from 'twreporter-react-article-components/lib/main'
import _ from 'lodash';
import React from 'react';

export default class InfoBoxBlock extends React.Component {
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

  render() {
      if (!this.state.data) {
          return null;
      }

      return (
          <div
              contentEditable={false}
              >
              <AlignedInfoBox
                  {...this.state.data}
                  >
                  {this.props.children}
              </AlignedInfoBox>
          </div>
      );
  }
};
