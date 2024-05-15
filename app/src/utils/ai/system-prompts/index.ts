import {
  templatePythonCode as write,
  templatePythonCodeFix as fix,
} from './code';
import drawing from './drawing';
import functionTemplate from './function'; //Because function itself is a keyword
import line from './line';
import point from './point';
import text from './text';
import preprocessing from './preprocessing';

const output = {
  code: {
    write,
    fix,
  },
  drawing,
  functionTemplate,
  line,
  point,
  text,
  preprocessing,
};

export default output;
