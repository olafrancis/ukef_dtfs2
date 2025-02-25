const express = require('express');
const api = require('../../api');
const { requestParams, generateErrorSummary, errorHref, validationErrorHandler } = require('../../helpers');
const CONSTANTS = require('../../constants');
const { FEATURE_FLAGS } = require('../../config/feature-flag.config');
const { renderCheckYourEmailPage, sendNewSignInLink } = require('../../controllers/login/check-your-email');
const { validatePartialAuthToken } = require('../middleware/validatePartialAuthToken');

const router = express.Router();

router.get('/login', (req, res) => {
  const { passwordreset, passwordupdated } = req.query;
  return res.render('login/index.njk', {
    passwordreset,
    passwordupdated,
    user: req.session.user,
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const loginErrors = [];

  const emailError = {
    errMsg: 'Enter an email address in the correct format, for example, name@example.com',
    errRef: 'email',
  };
  const passwordError = {
    errMsg: 'Enter a valid password',
    errRef: 'password',
  };

  if (!email || !password) {
    if (!email) loginErrors.push(emailError);
    if (!password) loginErrors.push(passwordError);

    return res.render('login/index.njk', {
      errors: validationErrorHandler(loginErrors),
    });
  }

  if (!FEATURE_FLAGS.MAGIC_LINK) {
    const tokenResponse = await api.login(email, password);

    if (!tokenResponse.success) {
      loginErrors.push(emailError);
      loginErrors.push(passwordError);

      return res.render('login/index.njk', {
        errors: validationErrorHandler(loginErrors),
      });
    }

    const { token, user } = tokenResponse;
    req.session.userToken = token;
    req.session.user = user;
    req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;

    return res.redirect('/dashboard/deals/0');
  }

  try {
    const tokenResponse = await api.login(email, password);

    const { token, loginStatus, user: { email: userEmail } } = tokenResponse;
    req.session.userToken = token;
    req.session.loginStatus = loginStatus;
    req.session.numberOfSendSignInLinkAttemptsRemaining = 2;
    // We do not store this in the user object to avoid existing logic using the existence of a `user` object to draw elements
    req.session.userEmail = userEmail;

    try {
      await api.sendSignInLink(token);
    } catch (sendSignInLinkError) {
      console.warn(
        'Failed to send sign in link. The login flow will continue as the user can retry on the next page. The error was: %O',
        sendSignInLinkError,
      );
    }

    return res.redirect('/login/check-your-email');
  } catch (loginError) {
    console.warn('Failed to login: %O', loginError);

    loginErrors.push(emailError);
    loginErrors.push(passwordError);

    return res.render('login/index.njk', {
      errors: validationErrorHandler(loginErrors),
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Initiate reset password email request - page
router.get('/reset-password', (req, res) => {
  const { passwordreseterror } = req.query;
  return res.render('reset-password.njk', {
    passwordreseterror,
  });
});

// Initiate reset password email request
router.post('/reset-password', async (req, res) => {
  const emailError = {
    errMsg: 'Enter an email address in the correct format, for example, name@example.com',
    errRef: 'email',
  };
  const loginErrors = [];
  const { email } = req.body;

  if (!email) {
    loginErrors.push(emailError);
    return res.render('reset-password.njk', {
      errors: validationErrorHandler(loginErrors),
    });
  }

  const { success } = await api.resetPassword(email);

  if (success) {
    return res.redirect('/login?passwordreset=1');
  }

  // If all of the above fails
  return res.redirect('/reset-password?passwordreseterror=1');
});

/**
 * 1. User forgot password
 * 2. Admin account create - user set's password
 */
router.get('/reset-password/:pwdResetToken', (req, res) => {
  res.render('user/change-password.njk', { requireCurrentPassword: false });
});

/**
 * 1. User forgot password
 * 2. Admin account create - user set's password
 */
router.post('/reset-password/:pwdResetToken', async (req, res) => {
  const { pwdResetToken } = requestParams(req);
  const { data } = await api.resetPasswordFromToken(pwdResetToken, req.body);

  const formattedValidationErrors = generateErrorSummary(data.errors, errorHref);

  if (formattedValidationErrors && formattedValidationErrors.count > 0) {
    return res.render('user/change-password.njk', {
      requireCurrentPassword: false,
      validationErrors: formattedValidationErrors,
    });
  }

  return res.redirect('/login?passwordupdated=1');
});

router.get('/login/check-your-email', validatePartialAuthToken, renderCheckYourEmailPage);
router.post('/login/check-your-email', validatePartialAuthToken, sendNewSignInLink);

router.get('/login/sign-in-link-expired', (req, res) => {
  res.render('login/sign-in-link-expired.njk');
});

router.get('/login/sign-in-link', async (req, res) => {
  const { userToken } = requestParams(req);
  const { t: signInToken } = req.query;
  try {
    const tokenResponse = await api.loginWithSignInLink({ token: userToken, signInToken });
    const { token: newUserToken, loginStatus, user } = tokenResponse;

    req.session.userToken = newUserToken;
    req.session.user = user;
    req.session.loginStatus = loginStatus;
    req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;
    delete req.session.numberOfSendSignInLinkAttemptsRemaining;
    delete req.session.userEmail;
    return res.redirect('/dashboard/deals/0');
  } catch (e) {
    console.error(`Error validating sign in link: ${e}`);

    if (e.response?.status === 403) {
      return res.redirect('/login/sign-in-link-expired');
    }

    return res.status(500).render('_partials/problem-with-service.njk');
  }
});

module.exports = router;
