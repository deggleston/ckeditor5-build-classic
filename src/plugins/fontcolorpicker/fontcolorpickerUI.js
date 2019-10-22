import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import fontColorIcon from '@ckeditor/ckeditor5-font/theme/icons/font-color.svg';

import ColorPickerFormView from '../utils/colorpickerformview';

import '@simonwep/pickr/dist/themes/nano.min.css';
import Pickr from '@simonwep/pickr';
import './theme/fontcolorpicker.css';

export default class FontColorPickerUI extends Plugin {
	static get pluginName() {
		return 'FontColorPickerUI';
	}

	init() {
		const editor = this.editor;
		const command = editor.commands.get( 'fontcolorpicker' );
		const t = editor.t;
		const fontcolors = editor.config.get( 'fontcolorConfig.colors' );

		this.form = new ColorPickerFormView( getFormValidators( editor.t ), editor.locale );

		editor.ui.componentFactory.add( 'fontcolorpicker', locale => {
			const dropdown = createDropdown( locale );

			this._setUpDropdown( dropdown, this.form, command, editor );
			this._setUpForm( this.form, dropdown, command );

			return dropdown;
		} );

		// editor.ui.componentFactory.add( 'fontcolorpicker', locale => {
		//     const view = new ButtonView( locale );

		//     view.set( {
		//         label: 'Font Color',
		//         icon: fontColorIcon,
		//         tooltip: true
		//     } );

		//     // Callback executed once the image is clicked.
		//     view.on( 'execute', () => {
		//         const color = prompt( 'Font Color' );

		//         editor.execute( 'fontcolorpicker', { value: color } );
		//         editor.editing.view.focus();
		//     } );

		//     return view;
		// } );

		// The "placeholder" dropdown must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		// editor.ui.componentFactory.add( 'fontcolorpicker', locale => {
		//     const dropdownView = createDropdown( locale );

		//     // Populate the list in the dropdown with items.
		//     addListToDropdown( dropdownView, getDropdownItemsDefinitions( fontcolors ) );

		//     dropdownView.buttonView.set( {
		//         // The t() function helps localize the editor. All strings enclosed in t() can be
		//         // translated and change when the language of the editor changes.
		//         label: t( 'Font Color' ),
		//         icon: fontColorIcon,
		//         tooltip: true
		//     } );

		//     // Execute the command when the dropdown item is clicked (executed).
		//     this.listenTo( dropdownView, 'execute', evt => {
		//         editor.execute( 'fontcolorpicker', { value: evt.source.commandParam } );
		//         editor.editing.view.focus();
		//     } );

		//     return dropdownView;
		// } );
	}

	_setUpDropdown( dropdown, form, command ) {
		const editor = this.editor;
		const t = editor.t;
        const button = dropdown.buttonView;
        const defaultColor = editor.config.get( 'fontcolorConfig.defaultColor' );
		const swatchColors = editor.config.get( 'fontcolorConfig.colors' );

		dropdown.bind( 'isEnabled' ).to( command );
		dropdown.panelView.children.add( form );

		button.set( {
			label: t( 'Font Color' ),
			icon: fontColorIcon,
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
            else {
                form.colorPickr.setColor( defaultColor, true );
            }

			form.color = command.value || '';
			form.colorInputView.select();
			form.focus();
		}, { priority: 'low' } );

		dropdown.on( 'submit', () => {
			if ( form.isValid() ) {
				editor.execute( 'fontcolorpicker', form.color );
				closeUI();
			}
		} );

		dropdown.panelView.extendTemplate( {
			attributes: {
				class: [ 'font-color-picker' ]
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
				editor.execute( 'fontcolorpicker', color.toHEXA().toString() );
				closeUI();
			} );

			form.colorPickr.on( 'cancel', instance => {
				editor.execute( 'fontcolorpicker', null );
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

// function getDropdownItemsDefinitions( placeholderNames ) {
//     const itemDefinitions = new Collection();

//     for ( const name of placeholderNames ) {
//         const definition = {
//             type: 'button',
//             model: new Model( {
//                 commandParam: name,
//                 label: name,
//                 withText: true
//             } )
//         };

//         // Add the item definition to the collection.
//         itemDefinitions.add( definition );
//     }

//     return itemDefinitions;
// }
