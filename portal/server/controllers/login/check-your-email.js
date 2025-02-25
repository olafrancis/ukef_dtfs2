const api = require('../../api');
const { obscureEmail } = require('../../utils/obscure-email');

module.exports.renderCheckYourEmailPage = (req, res) => {
  const { session: { numberOfSendSignInLinkAttemptsRemaining, userEmail } } = req;

  if (typeof numberOfSendSignInLinkAttemptsRemaining !== 'number') {
    console.error('Number of send sign in link attempts remaining was not present in the session.');
    return res.render('_partials/problem-with-service.njk');
  }

  if (numberOfSendSignInLinkAttemptsRemaining <= 0) {
    return res.render(
      'login/we-have-sent-you-another-link.njk',
      { obscuredSignInLinkTargetEmailAddress: obscureEmail(userEmail) },
    );
  }

  if (numberOfSendSignInLinkAttemptsRemaining === 1) {
    return res.render('login/new-sign-in-link-sent.njk');
  }

  return res.render('login/check-your-email.njk');
};

module.exports.sendNewSignInLink = async (req, res) => {
  const { session: { numberOfSendSignInLinkAttemptsRemaining } } = req;

  if (!numberOfSendSignInLinkAttemptsRemaining || numberOfSendSignInLinkAttemptsRemaining < 0) {
    console.error(`User attempted to send a new sign in link without any attempts remaining. Attempts remaining count is ${numberOfSendSignInLinkAttemptsRemaining}.`);
    return res.status(403).render('_partials/problem-with-service.njk');
  }

  req.session.numberOfSendSignInLinkAttemptsRemaining = numberOfSendSignInLinkAttemptsRemaining - 1;

  try {
    await api.sendSignInLink(req.session.userToken);
  } catch (error) {
    console.warn(
      'Failed to send sign in link. The login flow will continue as the user can retry on the next page. The error was: %O',
      error,
    );
  }

  return res.redirect('/login/check-your-email');
};
