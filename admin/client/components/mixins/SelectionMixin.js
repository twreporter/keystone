'use strict';
import { shallowEqual } from 'react-pure-render';
import React from 'react';

const SelectionMixin = (superclass) => class extends superclass {
    constructor(props) {
        super(props);

        this.state = {
            items: props.items,
            selectedItems: props.selectedItems
        }
        this.handleSelect = this._handleSelect.bind(this);
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            items: nextProps.items,
            selectedItems: nextProps.selectedItems
        });
    }

    shouldComponentUpdate (nextProps, nextState) {
        let shouldUpdate = false;
        if ( this.props.updateSelection !== nextProps.updateSelection ||
            this.props.selectionLimit !== nextProps.selectionLimit ) {
                shouldUpdate = true;
            }
        return shouldUpdate || !shallowEqual(this.state, nextState);
    }

    _handleSelect (item) {
        let _selectItems = this.state.selectedItems;
        let filtered = _selectItems.filter((selectedItem) => {
            return selectedItem.id !== item.id;
        });

        // select the item
        if (filtered.length === _selectItems.length) {
            // select many
            if (this.props.selectionLimit > 1) {
                const len = filtered.length;
                if (len >= this.props.selectionLimit) {
                    filtered.shift();
                }
                // create a new array for pure render
                filtered = len === 0 ? [item] : filtered.concat(item);
            } else {
                filtered = [item];
            }
        }
        this.setState({
            selectedItems: filtered
        }, () => {
            this.props.updateSelection(filtered);
        });
    }
};

module.exports = SelectionMixin;
