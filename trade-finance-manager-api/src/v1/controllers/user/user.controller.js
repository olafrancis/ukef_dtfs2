const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const payloadVerification = require('./helpers/payload');
const { mapUserData } = require('./helpers/mapUserData.helper');
const { USER, PAYLOAD } = require('../../../constants');
const utils = require('../../../utils/crypto.util');

const businessRules = { loginFailureCount: 5 };

exports.findOne = async (_id, callback) => {
  if (!ObjectId.isValid(_id)) {
    throw new Error('Invalid User Id');
  }

  const collection = await db.getCollection('tfm-users');

  collection.findOne({ _id: { $eq: ObjectId(_id) } }, callback);
};

exports.findByUsername = async (username, callback) => {
  if (typeof username !== 'string') {
    throw new Error('Invalid Username');
  }

  const collection = await db.getCollection('tfm-users');
  collection.findOne({ username: { $eq: username } }, { collation: { locale: 'en', strength: 2 } }, callback);
};

exports.create = async (user, callback) => {
  const collection = await db.getCollection('tfm-users');
  const tfmUser = {
    ...user,
    status: USER.STATUS.ACTIVE,
  };

  delete tfmUser.token;
  delete tfmUser.password;

  if (payloadVerification(tfmUser, PAYLOAD.TFM.USER)) {
    const createUserResult = await collection.insertOne(tfmUser);

    const { insertedId: userId } = createUserResult;

    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid User Id');
    }

    const createdUser = await collection.findOne({ _id: { $eq: userId } });
    const mapUser = mapUserData(createdUser);

    return callback(null, mapUser);
  }

  return callback('Invalid TFM user payload', user);
};

exports.update = async (_id, update, callback) => {
  if (!ObjectId.isValid(_id)) {
    throw new Error('Invalid User Id');
  }

  const userUpdate = { ...update };
  const collection = await db.getCollection('tfm-users');

  collection.findOne({ _id: { $eq: ObjectId(_id) } }, async (error, existingUser) => {
    if (userUpdate.password) {
      // we're updating the password, so do the dance...
      const { password: newPassword } = userUpdate;
      const { salt: oldSalt, hash: oldHash, blockedPasswordList: oldBlockedPasswordList = [] } = existingUser;
      // remove the raw password
      delete userUpdate.password;
      delete userUpdate.passwordConfirm;
      delete userUpdate.currentPassword;

      // create new salt/hash for the new password
      const { salt, hash } = utils.genPassword(newPassword);
      // queue update of salt+hash, ie store the encrypted password
      userUpdate.salt = salt;
      userUpdate.hash = hash;
      // queue the addition of the old salt/hash to our list of blocked passwords that we re-check
      // in 'passwordsCannotBeReUsed' rule
      userUpdate.blockedPasswordList = oldBlockedPasswordList.concat([{ oldSalt, oldHash }]);
    }

    await collection.updateOne({ _id: { $eq: ObjectId(_id) } }, { $set: userUpdate }, {});

    callback(null, userUpdate);
  });
};

exports.updateLastLogin = async (user, sessionIdentifier, callback) => {
  if (!ObjectId.isValid(user._id)) {
    throw new Error('Invalid User Id');
  }

  const collection = await db.getCollection('tfm-users');
  const update = {
    lastLogin: Date.now(),
    loginFailureCount: 0,
    sessionIdentifier,
  };
  await collection.updateOne({ _id: { $eq: ObjectId(user._id) } }, { $set: update }, {});

  callback();
};

exports.incrementFailedLoginCount = async (user) => {
  if (!ObjectId.isValid(user._id)) {
    throw new Error('Invalid User Id');
  }

  const failureCount = user.loginFailureCount ? user.loginFailureCount + 1 : 1;
  const thresholdReached = (failureCount >= businessRules.loginFailureCount);

  const collection = await db.getCollection('tfm-users');
  const update = {
    loginFailureCount: failureCount,
    lastLoginFailure: Date.now(),
    status: thresholdReached ? USER.STATUS.BLOCKED : user.status,
  };

  await collection.updateOne(
    { _id: { $eq: ObjectId(user._id) } },
    { $set: update },
    {},
  );
};

exports.removeTfmUserById = async (_id, callback) => {
  if (ObjectId.isValid(_id)) {
    const collection = await db.getCollection('tfm-users');
    const status = await collection.deleteOne({ _id: { $eq: ObjectId(_id) } });

    return callback(null, status);
  }

  return callback('Invalid TFM user id', 400);
};
