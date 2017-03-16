import Field from '../Field';
import React from 'react';
import Select from 'react-select';
import { FormInput } from 'elemental';
import cx from 'classnames';



/**
 * TODO:
 * - Custom path support
 */

const INROW = 'in-row';
const INCOLIMN = 'in-column';


const imageSrc = {
	[INROW]:'articles-inRow',
	[INCOLIMN]:'articles-inColumn'
};

module.exports = Field.create({

	displayName: 'TitlePositionField',

	generateRadioGroup (nameValue, ops, value) {

		return ops.map((obj, i) => {
			const imgStyle = cx({
				'image-content': true,
				'current': obj.value === value
			})
			return (
				<label key={i} className="col-4 image-container">
  				<input type="radio" name={nameValue} value={obj.value} />
  				<img className={imgStyle} src={`https://storage.googleapis.com/twreporter-multimedia/images/${imageSrc[obj.value]}.png`} onClick={() => { this.valueChanged(obj.value); }}/>
				</label>
			);
		});
	},

	valueChanged (newValue) {
		// TODO: This should be natively handled by the Select component
		if (this.props.numeric && typeof newValue === 'string') {
			newValue = newValue ? Number(newValue) : undefined;
		}
		this.props.onChange({
			path: this.props.path,
			value: newValue,
		});

		this.setState({ active: newValue });
	},

	renderValue () {
		var selected = this.props.ops.find(option => option.value === this.props.value);
		return <FormInput noedit>{selected ? selected.label : null}</FormInput>;
	},

	renderField () {
		// TODO: This should be natively handled by the Select component
		var ops = (this.props.numeric) ? this.props.ops.map(function (i) { return { label: i.label, value: String(i.value) }; }) : this.props.ops;
		var value = (typeof this.props.value === 'number') ? String(this.props.value) : this.props.value;
		return <div className="row">{this.generateRadioGroup(this.props.path, ops, value)}</div>;
	},

});
