const _ = require('lodash');
const bcrypt = require('bcrypt');
const { bindCallback, of, throwError } = require('rxjs');
const { mergeMap } = require('rxjs/operators');

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

module.exports = hashPassword;
