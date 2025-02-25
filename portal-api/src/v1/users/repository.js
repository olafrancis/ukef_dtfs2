const { ObjectId } = require('mongodb');
const db = require('../../drivers/db-client');
const { transformDatabaseUser } = require('./transform-database-user');
const { InvalidUserIdError, InvalidUsernameError, UserNotFoundError } = require('../errors');

class UserRepository {
  async saveSignInTokenForUser({ userId, signInTokenSalt, signInTokenHash }) {
    const saltHex = signInTokenSalt.toString('hex');
    const hashHex = signInTokenHash.toString('hex');

    const userCollection = await db.getCollection('users');
    return userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: { signInToken: { hashHex, saltHex } } });
  }

  async findById(_id) {
    if (!ObjectId.isValid(_id)) {
      throw new InvalidUserIdError(_id);
    }

    const collection = await db.getCollection('users');
    const user = await collection.findOne({ _id: { $eq: ObjectId(_id) } });
    if (!user) {
      throw new UserNotFoundError(_id);
    }
    return transformDatabaseUser(user);
  }

  async findByUsername(username) {
    if (typeof username !== 'string') {
      throw new InvalidUsernameError(username);
    }

    const collection = await db.getCollection('users');
    const user = collection.findOne({ username: { $eq: username } }, { collation: { locale: 'en', strength: 2 } });

    if (!user) {
      throw new UserNotFoundError(username);
    }
    return transformDatabaseUser(user);
  }
}

module.exports = {
  UserRepository,
};
