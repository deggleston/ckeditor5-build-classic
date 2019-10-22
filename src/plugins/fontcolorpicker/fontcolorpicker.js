import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import FontColorPickerEditing from './fontcolorpickerEditing';
import FontColorPickerUI from './fontcolorpickerUI';

export default class FontColorPicker extends Plugin {
	static get requires() {
		return [ FontColorPickerEditing, FontColorPickerUI ];
	}
}
