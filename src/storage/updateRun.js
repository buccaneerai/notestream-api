const {throwError} = require('rxjs');

const {client} = require('@buccaneerai/graphql-sdk');

const errors = {
  runIdRequired: () => new Error('runIdRequired')
};

const gql = (url = process.env.GRAPHQL_URL, token = process.env.JWT_TOKEN) => (
  client({token, url})
);

const updateRun = ({runId, _gql = gql()} = {}) => set => {
  if (!runId) return throwError(errors.runIdRequired());
  return _gql.updateRun({docId: runId, set});
};

module.exports = updateRun;
module.exports.testExports = {
  errors
};
