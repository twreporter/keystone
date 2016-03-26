import React from 'react';

class StyleButton extends React.Component {
    constructor(props) {
        super(props);
        this._textValue = '';
        this._urlValue = '';
        this.state = {
            active: props.active,
            shouldRenderEditingBlock: false
        };
        this.renderEditingBlock = this._renderEditingBlock.bind(this);
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            active: nextProps.active,
            shouldRenderEditingBlock: false
        });
    }

    _renderEditingBlock (e) {
        this.setState({
            shouldRenderEditingBlock: true
        });
    }

    render() {
        const { active, shouldRenderEditingBlock } = this.state;
        let className = 'RichEditor-styleButton Button Button--link';
        if (active) {
            className += ' RichEditor-activeButton';
        }

        return (
            <span className={className} onClick={this.renderEditingBlock}>
                {this.props.label}
            </span>
        );
    }
}

StyleButton.propTypes = {
    active: React.PropTypes.bool,
    label: React.PropTypes.string
};

StyleButton.defaultProps = {
    active: false,
    label: 'base'
};

export default StyleButton;
