import { from } from 'rxjs';
// import { ajax } from 'rxjs/ajax';
// import {catchError} from 'rxjs/operators';
import { GraphQLClient } from 'graphql-request';

import config from '../utils/config';
// import trace from '../operators/trace';

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

export default graphqlRequest;
