import { tap } from 'rxjs/operators';
import { info as logInfo } from '../utils/logger';

const trace = (label, log = logInfo) => tap(data => log(label, data));

export default trace;
