import { throwError } from 'rxjs';

const unauthorized = function unauthorized() {
  return throwError(new Error('unauthorized'));
};

export default unauthorized;
