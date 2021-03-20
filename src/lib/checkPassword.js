const bcrypt = require('bcrypt');
const { bindCallback, of, throwError } = require('rxjs');
const { mergeMap } = require('rxjs/operators');

const checkPassword = function checkPassword({
  plainPassword,
  user,
  _compare = bindCallback(bcrypt.compare)
}) {
  if (!user.hash) return throwError(new Error('user not found'));
  const compare$ = _compare(plainPassword, user.hash).pipe(
    mergeMap(([err, isMatch]) => (
      err || !isMatch
      ? throwError(new Error('Password does not match'))
      : of(isMatch)
    ))
  );
  return compare$;
};

module.exports = checkPassword;
