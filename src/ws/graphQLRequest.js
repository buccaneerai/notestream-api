const { from } = require('rxjs');
// import { ajax } = require('rxjs/ajax');
// import {catchError} = require('rxjs/operators');
const { GraphQLClient } = require('graphql-request');

const config = require('../utils/config');
// import trace = require('../operators/trace');

const graphqlClient = () => {
  // const token = _getState().getState().users.token;
  // do not send expired tokens or the backend will be unhappy.
  // let headers = {};
  // if (token && tokenIsValid({token})) headers.Authorization = `Bearer ${token}`;
  return new GraphQLClient(config().GRAPHQL_URL);
};

// TODO: Answer this Brian -> Should every request be getting a new client?
function graphqlRequest(query, variables = null) {
  const client = graphqlClient();
  const res$ = from(client.request(query, variables)).pipe();
  return res$;
}

module.exports = graphqlRequest;
