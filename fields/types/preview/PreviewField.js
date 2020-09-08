import Field from '../Field';
import React from 'react';
import { Button, FormField } from 'elemental';

module.exports = Field.create({
	displayName: 'PreviewField',
	renderUI () {
    const previewOrigin = Keystone.previewOrigin || 'https://keystone-preview.twreporter.org'
    let url = `${previewOrigin}/a/${this.props.values.name}`;
		return (
			<FormField className="field-type-preview">
				<Button type="default"><a href={url} target="_blank">{this.props.label}</a></Button>
			</FormField>
		);
	},
});
