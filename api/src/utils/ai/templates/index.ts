import {
  templatePythonCode as write,
  templatePythonCodeFix as fix,
} from './code';
import drawing from './drawing';
import linear from './function';
import line from './line';
import point from './point';
import text from './text';
import state from './state';
import preprocessing from './preprocessing';

const output = {
  code: {
    write,
    fix,
  },
  drawing,
  linear,
  line,
  point,
  text,
  state,
  preprocessing,
};

export default output;
