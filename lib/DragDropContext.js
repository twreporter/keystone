// Note:
// Fix multiple backend issue of React-dnd.
// Reference: https://github.com/react-dnd/react-dnd/issues/708
import { DragDropContext } from 'react-dnd';
import HTML5 from 'react-dnd-html5-backend';

export default DragDropContext(HTML5);
