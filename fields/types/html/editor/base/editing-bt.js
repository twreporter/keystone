import React from 'react';

export default ({ onClick }) => {
	return (
		<i className="fa fa-pencil-square-o" onClick={onClick} style={{
			position: 'absolute',
			fontSize: '50px',
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
			width: '55px',
			height: '50px',
			margin: 'auto',
			backgroundColor: '#FFF',
			borderRadius: '5px',
			textAlign: 'center',
			cursor: 'pointer',
		}}/>
	);
};
