import SimpleBoxEditing from './simpleBoxEditing';
import SimpleBoxUI from './simpleBoxUI';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import './simpleBox.css'

export default class SimpleBox extends Plugin {
    static get requires() {
        return [ SimpleBoxEditing, SimpleBoxUI ];
    }
}