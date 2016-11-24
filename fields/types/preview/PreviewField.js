import React from 'react';
import Field from '../Field';
import { Button, FormField } from 'elemental';

module.exports = Field.create({
	displayName: 'PreviewField',
	renderUI () {
    let url = `http://keystone-preview.twreporter.org/a/${this.props.values.name}`;
		return (
			<FormField className="field-type-preview">
				<Button type="default"><a href={url} target="_blank">{this.props.label}</a></Button>
			</FormField>
		);
	},
});
