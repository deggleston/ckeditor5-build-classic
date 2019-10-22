import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import bgColorIcon from '@ckeditor/ckeditor5-font/theme/icons/font-background.svg';

import ColorPickerFormView from '../utils/colorpickerformview';

import '@simonwep/pickr/dist/themes/nano.min.css';
import Pickr from '@simonwep/pickr';
import './theme/bgcolorpicker.css';

export default class BGColorPickerUI extends Plugin {
	static get pluginName() {
		return 'BGColorPickerUI';
	}

	init() {
		console.log( 'BGColorPickerUI#init() got called' );

		const editor = this.editor;
		const command = editor.commands.get( 'bgcolorpicker' );
		const t = editor.t;

		this.form = new ColorPickerFormView( getFormValidators( editor.t ), editor.locale );

		editor.ui.componentFactory.add( 'bgcolorpicker', locale => {
			const dropdown = createDropdown( locale );

			this._setUpDropdown( dropdown, this.form, command, editor );
			this._setUpForm( this.form, dropdown, command );

			return dropdown;
		} );
	}

	_setUpDropdown( dropdown, form, command ) {
		const editor = this.editor;
		const t = editor.t;
		const button = dropdown.buttonView;
		const defaultColor = editor.config.get( 'bgcolorConfig.defaultColor' );
		const swatchColors = editor.config.get( 'bgcolorConfig.colors' );

		dropdown.bind( 'isEnabled' ).to( command );
		dropdown.panelView.children.add( form );

		button.set( {
			label: t( 'Font Background Color' ),
			icon: bgColorIcon,
			tooltip: true
		} );

		// Note: Use the low priority to make sure the following listener starts working after the
		// default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
		// invisible form/input cannot be focused/selected.
		button.on( 'open', () => {
			// Make sure that each time the panel shows up, the color field remains in sync with the value of
			// the command. If the user typed in the input, then canceled (`colorInputView#value` stays
			// unaltered) and re-opened it without changing the value of the media command (e.g. because they
			// didn't change the selection), they would see the old value instead of the actual value of the
			// command.

			if ( command.value ) {
				form.colorPickr.setColor( command.value, true );
			}

			form.color = command.value || '';
			form.colorInputView.select();
			form.focus();
		}, { priority: 'low' } );

		dropdown.on( 'submit', () => {
			if ( form.isValid() ) {
				editor.execute( 'bgcolorpicker', form.color );
				closeUI();
			}
		} );

		dropdown.panelView.extendTemplate( {
			attributes: {
				class: [ 'bg-color-picker' ]
			}
		} );

		dropdown.on( 'render', () => {
			form.colorPickr = Pickr.create( {
				el: form.element,
				theme: 'nano',
				inline: true,
				showAlways: true,
				default: defaultColor,
				swatches: swatchColors,

				components: {

					// Main components
					preview: true,
					opacity: true,
					hue: true,

					// Input / output Options
					interaction: {
						hex: false,
						rgba: false,
						hsla: false,
						hsva: false,
						cmyk: false,
						input: true,
						clear: false,
						save: true,
						cancel: true
					}
				},
				strings: {
					save: 'OK', // Default for save button
					clear: 'Clear', // Default for clear button
					cancel: 'Remove' // Default for cancel button
				}
			} );

			form.colorPickr.on( 'save', ( color, instance ) => {
				console.log( 'save', color, color.toHEXA().toString(), instance );
				editor.execute( 'bgcolorpicker', color.toHEXA().toString() );
				closeUI();
			} );

			form.colorPickr.on( 'cancel', instance => {
				console.log( 'cancel', instance );
				editor.execute( 'bgcolorpicker', null );
				closeUI();
			} );
		} );

		dropdown.on( 'change:isOpen', () => form.resetFormStatus() );
		dropdown.on( 'cancel', () => closeUI() );

		function closeUI() {
			editor.editing.view.focus();
			dropdown.isOpen = false;
		}
	}

	_setUpForm( form, dropdown, command ) {
		form.delegate( 'submit', 'cancel' ).to( dropdown );
		form.colorInputView.bind( 'value' ).to( command, 'value' );

		// Form elements should be read-only when corresponding commands are disabled.
		form.colorInputView.bind( 'isReadOnly' ).to( command, 'isEnabled', value => !value );
		form.saveButtonView.bind( 'isEnabled' ).to( command );
	}
}

function getFormValidators( t ) {
	return [
		form => {
			if ( !form.color.length ) {
				return t( 'The color must not be empty.' );
			}
		}
	];
}
