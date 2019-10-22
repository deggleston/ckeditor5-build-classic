import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import BGColorPickerEditing from './bgcolorpickerEditing';
import BGColorPickerUI from './bgcolorpickerUI';

export default class BGColorPicker extends Plugin {
	static get requires() {
		return [ BGColorPickerEditing, BGColorPickerUI ];
	}
}
