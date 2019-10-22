import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FontColorPickerCommand from './fontcolorpickerCommand';

export default class FontColorPickerEditing extends Plugin {
	init() {
		console.log( 'FontColorPickerEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'fontcolorpicker', new FontColorPickerCommand( this.editor ) );

		// this.editor.editing.mapper.on(
		//     'viewToModelPosition',
		//     viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'placeholder' ) )
		// );

		// this.editor.config.define( 'placeholderConfig', {                           // ADDED
		//     types: [ 'date', 'first name', 'surname' ]
		// } );
	}

	_defineSchema() { // ADDED
		const schema = this.editor.model.schema;

		// Allow the font color attribute on text nodes.
		schema.extend( '$text', { allowAttributes: 'fontColor' } );

		schema.setAttributeProperties( 'fontColor', {
			isFormatting: true,
			copyOnEnter: true
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'span',
				styles: {
					'color': /[\s\S]+/
				}
			},
			model: {
				key: 'fontColor',
				value: renderUpcastAttribute( 'color' )
			}
		} );

		conversion.for( 'downcast' ).attributeToElement( {
			model: 'fontColor',
			view: renderDowncastElement( 'color' )
		} );
	}
}

function renderUpcastAttribute( styleAttr ) {
	return viewElement => normalizeColorCode( viewElement.getStyle( styleAttr ) );
}

function renderDowncastElement( styleAttr ) {
	return ( modelAttributeValue, viewWriter ) => viewWriter.createAttributeElement( 'span', {
		style: `${ styleAttr }:${ modelAttributeValue }`
	}, { priority: 7 } );
}

function normalizeColorOptions( options ) {
	return options
		.map( normalizeSingleColorDefinition )
		.filter( option => !!option );
}

// Fixes the color value string.
//
// @param {String} value
// @returns {String}
function normalizeColorCode( value ) {
	return value.replace( /\s/g, '' );
}

// Creates a normalized color definition from the user-defined configuration.
//
// @param {String|module:ui/colorgrid/colorgrid~ColorDefinition}
// @returns {module:ui/colorgrid/colorgrid~ColorDefinition}
function normalizeSingleColorDefinition( color ) {
	if ( typeof color === 'string' ) {
		return {
			model: color.replace( / /g, '' ),
			label: color,
			hasBorder: false,
			view: {
				name: 'span',
				styles: {
					color
				}
			}
		};
	} else {
		return {
			model: color.color.replace( / /g, '' ),
			label: color.label || color.color,
			hasBorder: color.hasBorder === undefined ? false : color.hasBorder,
			view: {
				name: 'span',
				styles: {
					color: `${ color.color }`
				}
			}
		};
	}
}
