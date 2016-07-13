import ButtonIcon from './button-icon';
import React, { Component } from 'react';

const getDisplayName = (WrappedComponent) => (
	WrappedComponent.displayName || WrappedComponent.name || 'Component'
);

// Export
export default function WrapComponent (EditingBlockComponent) {
	class Wrapper extends Component {
		constructor (props) {
			super(props);
			this.state = {
				isToggled: true,
			};
			this.toggleModal = this._toggleModal.bind(this);
		}

		_toggleModal () {
			this.setState({
				isToggled: !this.state.isToggled,
			});
		}

		render () {
			return (
				<div
					className="Button Button--default"
					style={{ display: 'inline-block' }}
					onClick={this.toggleModal}
				>
					<EditingBlockComponent
						{...this.props}
						isModalOpen={!this.state.isToggled}
						toggleModal={this.toggleModal}
					/>
					<ButtonIcon
						{...this.props}
					/>
				</div>
			);
		}
	}
	Wrapper.displayName = `ButtonWith${getDisplayName(EditingBlockComponent)}`;
	Wrapper.defaultProps = {
		readOnly: false,
	};

	return Wrapper;
}
