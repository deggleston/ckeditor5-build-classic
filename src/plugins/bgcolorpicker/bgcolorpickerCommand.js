import Command from '@ckeditor/ckeditor5-core/src/command';

export default class BGColorPickerCommand extends Command {
	execute( value ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		model.change( writer => {
			if ( selection.isCollapsed ) {
				if ( value ) {
					writer.setSelectionAttribute( 'fontBackgroundColor', value );
				} else {
					writer.removeSelectionAttribute( 'fontBackgroundColor' );
				}
			} else {
				const ranges = model.schema.getValidRanges( selection.getRanges(), 'fontBackgroundColor' );

				for ( const range of ranges ) {
					if ( value ) {
						writer.setAttribute( 'fontBackgroundColor', value, range );
					} else {
						writer.removeAttribute( 'fontBackgroundColor', range );
					}
				}
			}
		} );
	}

	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = doc.selection.getAttribute( 'fontBackgroundColor' );
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'fontBackgroundColor' );
	}
}
