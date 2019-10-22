import Command from '@ckeditor/ckeditor5-core/src/command';

export default class FontColorPickerCommand extends Command {
	execute( value ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		model.change( writer => {
			if ( selection.isCollapsed ) {
				if ( value ) {
					writer.setSelectionAttribute( 'fontColor', value );
				} else {
					writer.removeSelectionAttribute( 'fontColor' );
				}
			} else {
				const ranges = model.schema.getValidRanges( selection.getRanges(), 'fontColor' );

				for ( const range of ranges ) {
					if ( value ) {
						writer.setAttribute( 'fontColor', value, range );
					} else {
						writer.removeAttribute( 'fontColor', range );
					}
				}
			}
		} );
	}

	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = doc.selection.getAttribute( 'fontColor' );
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'fontColor' );
	}
}
