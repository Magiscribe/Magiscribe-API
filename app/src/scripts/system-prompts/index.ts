import appState from './appState';
import {
  templatePythonCode as writePython,
  templatePythonCodeFix as fixPython,
} from './code';
import drawing from './drawing';
import functionTemplate from './function'; //Because function itself is a keyword
import line from './line';
import point from './point';
import text from './text';
import preprocessing from './preprocessing';
import ellipse from './ellipse';
import polygon from './polygon';
import arrow from './arrow';
import scroll from './scroll';
import zoom from './zoom';

const output = {
  appState,
  writePython,
  fixPython,
  drawing,
  functionTemplate,
  line,
  point,
  text,
  preprocessing,
  polygon,
  ellipse,
  arrow,
  scroll,
  zoom,
};

export default output;
