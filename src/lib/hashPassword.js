import _ from 'lodash';
import bcrypt from 'bcrypt';
import { bindCallback, of, throwError } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

// returns array with [hash<String>, salt<String>]
const hashPassword = function hashPassword({
  password,
  saltRounds = 12,
  _hash = bindCallback(bcrypt.hash)
}) {
  if (!_.isString(password)) return throwError(new Error('password is required'));
  const hash$ = _hash(password, saltRounds).pipe(
    mergeMap(([err, hash]) => (
      !hash || err
      ? throwError(err || new Error('invalid hash'))
      : of(hash)
    ))
  );
  return hash$;
};

export default hashPassword;
