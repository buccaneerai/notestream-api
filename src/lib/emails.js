import Mailchimp from 'mailchimp-api-v3';
import moment from 'moment';
import roundTo from 'round-to';
import {from} from 'rxjs';

import config from '../utils/config';

export const sendPasswordReset = function sendPasswordReset({
  userId,
  email,
  token,
  expiresAt,
  _mailchimp = new Mailchimp(config().MAILCHIMP_API_KEY),
  emailListId = config().MAILCHIMP_WELCOME_LIST_ID,
}) {
  const expirationDurationInDays = roundTo(
    moment.duration(moment().diff(expiresAt)).asDays(),
    0
  );
  const promise = _mailchimp.post(`/lists/${emailListId}/members`, {
    user_id: userId,
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      // FNAME: trial.firstName,
      // LNAME: trial.lastName,
      // JOBTITLE: trial.jobTitle,
      SECRET_RESET_TOKEN: token,
      EXPIRATION: expiresAt,
      EXPIRES_IN_DAYS: expirationDurationInDays,
      ACTION: 'PASSWORD_RESET',
    }
  });
  const response$ = from(promise);
  return response$;
};

export const sendWelcomeEmail = function sendWelcomeEmail() {

};
