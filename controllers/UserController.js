const User = require('../models/User');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcryptjs');

const { promisify } = require('util');
const bcryptSalt = promisify(bcrypt.genSalt);
const bcryptHash = promisify(bcrypt.hash);
const bcryptCompare = promisify(bcrypt.compare);
/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.password - The password of user.
 * @returns {User}
 */
async function create(req, res, next) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  const savedUser = await user.save();
  req.session.key = savedUser._id.toHexString();
  res.json(savedUser);
}

/**
 * Get all users
 * @returns {User}
 */
async function findAll(req, res, next) {
  const users = await User.find();
  if (users) {
    return res.status(200).json({ users });
  }

  return res.status(500).json({ message: 'INTERNAL_ERROR' });
}

/**
 * Get user by User id
 * @returns {User}
 */
async function findById(req, res, next) {
  const userId = req.params.userId;

  if (!ObjectID.isValid(userId)) {
    return res.status(422).json({ message: 'WRONG_ID_FORMAT' });
  }

  const user = await User.findOne({ _id: userId });
  if (user) {
    return res.status(200).json({ user });
  }

  return res.status(404).json({ message: 'USER_NOT_FOUND' });
}

/**
 * Get user from the session token
 * @returns {User}
 */
async function findByToken(req, res, next) {
  const userId = req.session.key;

  if (!ObjectID.isValid(userId)) {
    return res.status(422).json({ message: 'WRONG_ID_FORMAT' });
  }

  const user = await User.findOne({ _id: userId });
  if (user) {
    return res.status(200).json({ user });
  }

  return res.status(404).json({ message: 'USER_NOT_FOUND' });
}
/**
 * Get user by Token
 * @returns {User}
 */

async function login(req, res, next) {
  if (!req.body.username) {
    return res.status(422).json({ message: 'MISSING_EMAIL' });
  }

  if (!req.body.password) {
    return res.status(422).json({ message: 'MISSING_PASSWORD' });
  }

  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({ message: 'USER_NOT_FOUND' });
  }

  const compared = await bcryptCompare(password, user.password);

  if (!compared) {
    return res.status(401).json({ message: 'WRONG_CREDENTIALS' });
  }

  req.session.key = user._id.toHexString();
  res.status(200).json(user);
}

async function update(req, res, next) {
  const userId = req.params.userId;
  if (!req.body.username) {
    return res.status(422).json({ message: 'MISSING_EMAIL' });
  }

  if (!req.body.password) {
    return res.status(422).json({ message: 'MISSING_PASSWORD' });
  }

  if (!ObjectID.isValid(userId)) {
    return res.status(422).json({ message: 'WRONG_ID_FORMAT' });
  }
  const { username, password } = req.body;

  const modifiedUser = await User.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        username: req.body.username,
        password: req.body.password
      }
    }
  );

  res.status(200).json(modifiedUser);
}

async function updateFields(req, res, next) {
  const userId = req.params.userId;

  if (!ObjectID.isValid(userId)) {
    return res.status(422).json({ message: 'WRONG_ID_FORMAT' });
  }

  const keys = Object.keys(req.body);
  const fieldsToUpdate = keys.reduce((fields, key, index, array) => {
    if (typeof req.body[key] === 'undefined') {
      delete fields[key];
    }
    return fields;
  }, req.body);

  const modifiedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $set: fieldsToUpdate }
  );

  res.status(200).json(modifiedUser);
}

module.exports = {
  create,
  findAll,
  findById,
  findByToken,
  login,
  update,
  updateFields
};
