const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const db = require('./database-client');
const { LOGIN_STATUSES } = require('../../../src/constants');

const PRIV_KEY = Buffer.from(process.env.JWT_SIGNING_KEY, 'base64').toString('ascii');

function issueJWTWithExpiryAndPayload({ user, sessionIdentifier, expiresIn, additionalPayload }) {
  const { _id } = user;

  const payload = {
    sub: _id,
    sessionIdentifier,
    ...additionalPayload,
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn, algorithm: 'RS256' });

  return {
    token: `Bearer ${signedToken}`,
    expires: expiresIn,
    sessionIdentifier,
  };
}

function issueValidUsernameAndPasswordJWT(user, sessionIdentifier) {
  return issueJWTWithExpiryAndPayload({
    user,
    sessionIdentifier,
    expiresIn: '105m',
    additionalPayload: { username: user.username, loginStatus: LOGIN_STATUSES.VALID_USERNAME_AND_PASSWORD },
  });
}

function issueValid2faJWT(user, sessionIdentifier) {
  return issueJWTWithExpiryAndPayload({
    user,
    sessionIdentifier,
    expiresIn: '12h',
    additionalPayload: { username: user.username, roles: user.roles, bank: user.bank, loginStatus: LOGIN_STATUSES.VALID_2FA },
  });
}

const overrideUserSignInTokenByUsername = async ({ username, newSignInToken }) => {
  const salt = crypto.randomBytes(64);
  const hash = crypto.pbkdf2Sync(newSignInToken, salt, 210000, 64, 'sha512');
  const saltHex = salt.toString('hex');
  const hashHex = hash.toString('hex');
  const userCollection = await db.getCollection('users');
  await userCollection.updateOne({ username: { $eq: username } }, { $set: { signInToken: { hashHex, saltHex } } });
};

const createUserSessionWithLoggedInStatus = async ({ user, loginStatus }) => {
  try {
    const userCollection = await db.getCollection('users');
    const userFromDatabase = await userCollection.findOne({ username: { $eq: user.username } }, { collation: { locale: 'en', strength: 2 } });

    const sessionIdentifier = crypto.randomBytes(32).toString('hex');

    if (loginStatus === LOGIN_STATUSES.VALID_USERNAME_AND_PASSWORD) {
      const { token } = issueValidUsernameAndPasswordJWT(userFromDatabase, sessionIdentifier);
      await userCollection.updateOne({ _id: { $eq: userFromDatabase._id } }, { $set: { sessionIdentifier } });

      const signInToken = crypto.randomBytes(32).toString('hex');
      await overrideUserSignInTokenByUsername({ username: user.username, newSignInToken: signInToken });

      return { userId: userFromDatabase._id.toString(), token, signInToken };
    } if (loginStatus === LOGIN_STATUSES.VALID_2FA) {
      const { token } = issueValid2faJWT(userFromDatabase, sessionIdentifier);
      const lastLogin = Date.now().toString();
      await userCollection.updateOne({ _id: { $eq: userFromDatabase._id } }, { $set: { sessionIdentifier, lastLogin } });
      return { userId: userFromDatabase._id.toString(), token };
    }
    throw new Error('Invalid login status provided');
  } catch (e) {
    throw new Error(`Failed to create user session with status ${loginStatus} for user: ${user.username}: ${e}`);
  }
};

// We can call this function on a user by user basis to create a partially logged in user session
const createPartiallyLoggedInUserSession = async (user) => createUserSessionWithLoggedInStatus({
  user,
  loginStatus: LOGIN_STATUSES.VALID_USERNAME_AND_PASSWORD,
});

const createLoggedInUserSession = async (user) => createUserSessionWithLoggedInStatus({ user, loginStatus: LOGIN_STATUSES.VALID_2FA });

module.exports = { createLoggedInUserSession, createPartiallyLoggedInUserSession };
